package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Medical Files", description = "Upload and serve diagnostic images and lab attachments")
public class FileController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"
    );
    private static final long MAX_BYTES = 10L * 1024 * 1024; // 10 MB

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload diagnostic image or PDF document")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn tệp hình ảnh hoặc PDF hợp lệ");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Dung lượng tệp vượt quá giới hạn 10MB");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().trim() : "attachment.png";
        String lower = originalName.toLowerCase();
        int dotIdx = lower.lastIndexOf('.');
        String ext = dotIdx >= 0 ? lower.substring(dotIdx) : "";
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP, GIF hoặc PDF");
        }
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        if (!contentType.isEmpty()
                && !contentType.startsWith("image/")
                && !contentType.equals("application/pdf")
                && !contentType.equals("application/octet-stream")) {
            throw new BadRequestException("Loại nội dung tệp không hợp lệ. Chỉ chấp nhận ảnh y khoa hoặc PDF");
        }

        try {
            Files.createDirectories(uploadDir);
            String storedFilename = UUID.randomUUID().toString().replace("-", "") + ext;
            Path targetPath = uploadDir.resolve(storedFilename).normalize();
            if (!targetPath.startsWith(uploadDir)) {
                throw new BadRequestException("Đường dẫn tệp không hợp lệ");
            }
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Map<String, Object> payload = new HashMap<>();
            payload.put("url", "/api/files/" + storedFilename);
            payload.put("filename", storedFilename);
            payload.put("originalName", originalName);
            payload.put("size", file.getSize());
            return ResponseEntity.ok(ApiResponse.success(payload));
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu tệp đính kèm: " + e.getMessage());
        }
    }

    @GetMapping("/{filename:.+}")
    @Operation(summary = "Serve uploaded medical attachment")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new BadRequestException("Tên tệp không hợp lệ");
        }

        try {
            Path filePath = uploadDir.resolve(filename).normalize();
            if (!filePath.startsWith(uploadDir) || !Files.exists(filePath)) {
                throw new ResourceNotFoundException("Không tìm thấy tệp đính kèm");
            }

            Resource resource = new UrlResource(filePath.toUri());
            String lowerName = filename.toLowerCase();
            String contentType;
            if (lowerName.endsWith(".pdf")) contentType = MediaType.APPLICATION_PDF_VALUE;
            else if (lowerName.endsWith(".png")) contentType = MediaType.IMAGE_PNG_VALUE;
            else if (lowerName.endsWith(".webp")) contentType = "image/webp";
            else if (lowerName.endsWith(".gif")) contentType = MediaType.IMAGE_GIF_VALUE;
            else contentType = MediaType.IMAGE_JPEG_VALUE;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("X-Content-Type-Options", "nosniff")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (ResourceNotFoundException | BadRequestException ex) {
            throw ex;
        } catch (Exception e) {
            throw new ResourceNotFoundException("Không thể đọc tệp đính kèm");
        }
    }
}
