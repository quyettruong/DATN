# 🏥 Hệ Thống Điều Phối Khám Chữa Bệnh Ngoại Trú – MediCare (Hospital Flow)

Hệ thống thông tin bệnh viện thu nhỏ (**Mini HIS / EMR / Queue Management**) hỗ trợ toàn trình nghiệp vụ khám chữa bệnh ngoại trú: từ **Đặt lịch khám có mã QR & Thanh toán động VietQR NAPAS 247**, **Tiếp nhận – Phân loại sinh hiệu lâm sàng (Triage)**, **Điều phối hàng đợi ưu tiên đa trọng số**, **Khám bệnh & Cảnh báo tương tác thuốc / dị ứng**, **Trả kết quả xét nghiệm kèm phim chụp (Mini RIS/PACS)**, đến **Tự động quyết toán viện phí BHYT** và **Cấp phát thuốc kho Dược theo chuẩn FEFO**.

---

## 1. Kiến Trúc & Công Nghệ Sử Dụng

| Tầng hệ thống | Công nghệ & Thư viện chính |
| :--- | :--- |
| **Backend API** | Java 17, Spring Boot 3.2.5, Spring Security 6 (JWT + RBAC), Spring Data JPA / Hibernate, Spring WebSocket, Springdoc OpenAPI (Swagger UI) |
| **Cơ sở dữ liệu** | Microsoft SQL Server (quản trị qua SSMS / Azure Data Studio; hỗ trợ H2 In-Memory cho Unit Test độc lập) |
| **Frontend Web** | React 18, Vite 5 (Code-splitting & `React.lazy`), Zustand, Axios, Tailwind CSS, Recharts, Lucide Icons, `qrcode.react` |
| **Mobile App (Bệnh nhân)** | Flutter 3.44, Dart 3.12, Provider, Material 3, `qr_flutter`, `shared_preferences`, `intl`, `http` |
| **Kiểm thử tự động** | JUnit 5, Mockito, AssertJ (`18` kịch bản kiểm thử đơn vị cho các Service trọng yếu & bảo mật) |

---

## 2. Các Phân Hệ & Tính Năng Nổi Bật

1. **Cổng Bệnh nhân (`PATIENT`)**:
   - Đặt lịch khám theo Chuyên khoa – Bác sĩ – Khung giờ, sinh **Vé Khám Điện Tử QR** và thanh toán chuyển khoản nhanh qua **VietQR NAPAS 247**.
   - Tra cứu trực tiếp vị trí hàng đợi chờ khám, xem Hồ sơ lịch sử khám bệnh, Đơn thuốc điện tử, Biên lai viện phí và Lịch hẹn tái khám.
2. **Tiếp nhận, Điều dưỡng, Thu ngân & Nhà thuốc (`STAFF`)**:
   - Tiếp nhận bệnh nhân đặt lịch trước hoặc khách vãng lai (Walk-in), cấp phiếu STT tự động cân bằng tải phòng khám.
   - **Phân loại sinh hiệu (Nurse Triage)**: Đo Huyết áp, Mạch, Nhiệt độ, Cân nặng, Chiều cao, SpO₂ và gắn mức ưu tiên Đỏ / Vàng / Xanh (tự động điền sẵn sang màn hình Bác sĩ).
   - **Viện phí BHYT tự động**: Tổng hợp phí khám + cận lâm sàng + đơn thuốc, khấu trừ tự động theo mức hưởng BHYT (`0%`, `80%`, `95%`, `100%`) và in biên lai chuẩn.
   - **Cấp phát thuốc chuẩn FEFO**: Tự động trừ tồn kho từ lô có hạn sử dụng gần nhất (*First-Expired, First-Out*) và khóa chống xuất trùng đơn.
3. **Bàn Khám Bác sĩ (`DOCTOR`)**:
   - Gọi số thông minh lên Bảng điện tử TV ngoài hành lang (`/queue-display`), khám lâm sàng ICD-10, chỉ định cận lâm sàng và hẹn tái khám.
   - **Hệ thống Cảnh báo An toàn Dược lâm sàng**: Tự động phát hiện **Dị ứng chéo thuốc** từ tiền sử bệnh nhân, **Tương tác thuốc nghiêm trọng** (`CRITICAL`/`WARNING`) và **Trùng lặp hoạt chất** ngay khi kê đơn, in Đơn thuốc chuẩn Bộ Y tế.
4. **Phòng Xét nghiệm & Chẩn đoán hình ảnh (`LAB_TECHNICIAN`)**:
   - Tiếp nhận mẫu, nhập chỉ số xét nghiệm, cảnh báo kết quả bất thường, tải lên ảnh phim chụp X-quang / Siêu âm / PDF kết quả và tự động đẩy bệnh nhân quay lại hàng đợi ưu tiên (`-R`) gặp Bác sĩ.
5. **Quản trị Hệ thống (`ADMIN`)**:
   - Bảng điều khiển thống kê thời gian thực (doanh thu, lượt khám, thời gian chờ trung bình), quản lý Người dùng & Phân quyền, Chuyên khoa, Danh mục Thuốc, Danh mục Xét nghiệm, Kho dược và Cấu hình thuật toán hàng đợi (`PRIORITY` / `FIFO`).

---

## 3. Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu môi trường
- **JDK 17+** và **Maven 3.9+** (đã tích hợp sẵn Maven portable tại `tools/apache-maven-3.9.6`)
- **Node.js 18+** và **npm**
- **Microsoft SQL Server** (SSMS hoặc Azure Data Studio)

### Bước 1: Chuẩn bị Cơ sở dữ liệu trên Microsoft SQL Server
- Mở **SSMS** hoặc **Azure Data Studio**, kết nối vào SQL Server (`DESKTOP-KEMAOM8\SQLEXPRESS` hoặc `127.0.0.1,14333`) và tạo database trống đặt tên là `benhvien`.
- Mặc định hệ thống sử dụng tài khoản `hospital_user`, mật khẩu `Hospital@123` cấu hình tại `backend/src/main/resources/application.yml` (hoặc tài khoản Windows Authentication).

### Bước 2: Khởi chạy Backend (Cổng `8080`)
Khi chạy lần đầu, `DataSeeder` sẽ tự động khởi tạo đầy đủ 6 chuyên khoa, 12 phòng khám, 6 bác sĩ, bệnh nhân mẫu, danh mục thuốc/xét nghiệm, dữ liệu tương tác thuốc và lô tồn kho dược:
```powershell
cd backend
..\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
- Tài liệu API trực quan (Swagger UI): `http://localhost:8080/swagger-ui.html`

### Bước 3: Khởi chạy Frontend (Cổng `5173`)
```powershell
cd frontend
npm install
npm run dev
```
- Truy cập hệ thống Web tại: `http://localhost:5173`
- Màn hình TV Gọi số hành lang: `http://localhost:5173/queue-display`

### Bước 4: Khởi chạy Ứng dụng Bệnh nhân Mobile (Flutter)
Ứng dụng di động dành riêng cho **Bệnh nhân** (`mobile/`):
```powershell
cd mobile
C:\flutter\bin\flutter.bat pub get
C:\flutter\bin\flutter.bat run
```
- **Thiết bị chạy**: Có thể chọn Giả lập Android (Android Emulator), Điện thoại Android cắm cáp USB (hoặc Wi-Fi), hoặc trình duyệt Chrome (`-d chrome`).
- **Địa chỉ kết nối Backend**:
  - Giả lập Android: Mặc định kết nối tự động đến `http://10.0.2.2:8080/api`.
  - Thiết bị thật: Nhấn nút bánh răng Cài đặt tại màn hình Hồ sơ để nhập IP máy tính trong mạng nội bộ (ví dụ: `http://192.168.1.50:8080/api`).
  - Web/Desktop: Kết nối trực tiếp `http://localhost:8080/api`.

---

## 4. Chạy Kiểm Thử Tự Động (Unit Tests & Production Build)

```powershell
# Kiểm thử đơn vị Backend (18 kịch bản JUnit 5 + Mockito)
.\tools\apache-maven-3.9.6\bin\mvn.cmd -f .\backend\pom.xml test

# Kiểm tra đóng gói tối ưu Frontend Web
npm run build --prefix .\frontend

# Phân tích tĩnh & Kiểm thử ứng dụng Mobile Flutter (0 cảnh báo, 0 lỗi)
C:\flutter\bin\flutter.bat analyze mobile
cd mobile; C:\flutter\bin\flutter.bat test
```

---

## 5. Danh Sách Tài Khoản Demo (Mật khẩu chung: `123456`)

| Vai trò | Tên đăng nhập | Họ tên hiển thị | Phân hệ chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | Admin User | `/admin` – Thống kê, Người dùng, Danh mục, Kho dược, Cài đặt |
| **Bác sĩ Nội khoa** | `doctor1` | BS. Nguyễn Văn An | `/doctor` – Gọi khám, Bệnh án EMR, Cảnh báo thuốc, In đơn |
| **Bác sĩ Nhãn khoa** | `doctor5` | BS. Võ Minh Khôi | `/doctor` – Khám chuyên khoa Mắt |
| **Bác sĩ Da liễu** | `doctor6` | BS. Đặng Thu Thảo | `/doctor` – Khám chuyên khoa Da liễu |
| **Nhân viên Y tế** | `staff1` | Ngô Thị Hà | `/staff` – Check-in, Triage, Thu ngân BHYT, Cấp phát thuốc |
| **KTV Xét nghiệm** | `lab1` | Vũ Thị Lan | `/lab` – Xử lý mẫu, Trả kết quả & Đính kèm ảnh phim chụp |
| **Bệnh nhân** | `patient1` | Lê Thị Mai | `/` – Đặt lịch QR, Tra cứu STT, Hồ sơ khám *(Có tiền sử dị ứng Penicillin)* |

---

## 6. Kịch Bản Demo Bảo Vệ Đồ Án (8 Bước Khép Kín)

1. **Đặt lịch (`patient1`)**: Chọn chuyên khoa & bác sĩ → Nhận **Vé khám QR** & xem mã thanh toán động **VietQR**.
2. **Tiếp nhận (`staff1` → `/staff/check-in`)**: Xác nhận tiếp nhận lịch hẹn hoặc tạo ca vãng lai → In phiếu STT.
3. **Đo sinh hiệu (`staff1` → `/staff/triage`)**: Nhập Huyết áp, Nhịp tim, Nhiệt độ, SpO₂ và phân loại mức độ ưu tiên.
4. **Gọi số & Bảng TV (`doctor1` → `/doctor` + `/queue-display`)**: Bấm gọi bệnh nhân kế tiếp → Bảng TV phát âm báo và hiển thị số.
5. **Khám bệnh & Cảnh báo Dược (`doctor1` → `/doctor/examination`)**: Sinh hiệu tự động điền sẵn; thử kê **Amoxicillin** (dị ứng chéo Penicillin của `patient1`) hoặc **Ibuprofen + Dexamethasone** để trình diễn **Banner cảnh báo đỏ an toàn dược lâm sàng**; chỉ định xét nghiệm X-quang / Công thức máu.
6. **Xét nghiệm (`lab1` → `/lab/orders`)**: Nhập kết quả, tải ảnh phim chụp lên và hoàn tất → Bệnh nhân tự động được xếp lại vào hàng đợi ưu tiên (`Có KQ CLS`).
7. **Hoàn tất khám & Thu ngân BHYT (`doctor1` → `staff1` → `/staff/billing`)**: Bác sĩ hoàn tất ca khám → Hệ thống tự động gom phí khám + xét nghiệm + thuốc sang Quầy thu ngân → Áp mức BHYT `80%`, thanh toán VietQR/Tiền mặt và **In biên lai thu tiền**.
8. **Xuất thuốc FEFO (`staff1` → `/staff/pharmacy`)**: Kiểm tra tồn kho khả dụng, bấm **Xác nhận cấp phát thuốc** → Hệ thống tự động trừ lô cận hạn trước theo chuẩn FEFO.
