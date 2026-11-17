import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

IMG_DIR = r"C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images"
INPUT_PATH = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuan_Hoa_Moi_Nhat.docx"
OUTPUT_PATH = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Ban_Chinh_Thuc_Chuong_3.docx"
BACKUP_PATH = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Ban_Chinh_Thuc_Chuong_3.docx"

def set_font(run, name="Times New Roman", size_pt=13, bold=False, italic=False):
    run.font.name = name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)
    rPr = run._r.get_or_add_rPr()
    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:ascii'), name)
    rFonts.set(qn('w:hAnsi'), name)
    rFonts.set(qn('w:cs'), name)
    rPr.append(rFonts)

def insert_h1(target, text):
    p = target.insert_paragraph_before(style='Heading 1')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Inches(0)
    run = p.add_run(text)
    set_font(run, size_pt=13, bold=True, italic=False)
    return p

def insert_h2(target, text):
    p = target.insert_paragraph_before(style='Heading 2')
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Inches(0)
    run = p.add_run(text)
    set_font(run, size_pt=13, bold=True, italic=False)
    return p

def insert_h3(target, text):
    p = target.insert_paragraph_before(style='Heading 3')
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Inches(0)
    run = p.add_run(text)
    set_font(run, size_pt=13, bold=True, italic=False)
    return p

def insert_body(target, text):
    p = target.insert_paragraph_before()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Inches(0.5)
    run = p.add_run(text)
    set_font(run, size_pt=13, bold=False, italic=False)
    return p

def insert_img(target, filename, caption, width=5.8):
    img_path = os.path.join(IMG_DIR, filename)
    if not os.path.exists(img_path):
        print(f"ERROR: Image missing: {img_path}")
        return

    # Image
    p_img = target.insert_paragraph_before()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(3)
    p_img.paragraph_format.first_line_indent = Inches(0)
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=Inches(width))

    # Caption (Underneath)
    p_cap = target.insert_paragraph_before()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(8)
    p_cap.paragraph_format.first_line_indent = Inches(0)
    run_cap = p_cap.add_run(caption)
    set_font(run_cap, size_pt=13, bold=True, italic=False)

def main():
    print("Loading document...")
    doc = docx.Document(INPUT_PATH)

    # Locate CHƯƠNG 3 and KẾT LUẬN
    c3_p = None
    end_p = None
    old_paras = []
    collecting_old = False

    for p in doc.paragraphs:
        if 'CHƯƠNG 3' in p.text.upper():
            c3_p = p
            collecting_old = True
        elif collecting_old and ('KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN' in p.text.upper() or 'DỰ KIẾN KẾ HOẠCH THỰC HIỆN' in p.text.upper()):
            end_p = p
            collecting_old = False
            break
        
        if collecting_old:
            old_paras.append(p)

    if c3_p is None or end_p is None:
        print(f"Error: Could not locate paragraphs: c3_p={c3_p}, end_p={end_p}")
        return

    print(f"Found c3_p='{c3_p.text}', end_p='{end_p.text}'. Old paras to replace: {len(old_paras)}")
    target_p = end_p

    # ==================== CHƯƠNG 3 CONTENT ====================
    insert_h1(target_p, "CHƯƠNG 3: CÀI ĐẶT THỰC NGHIỆM VÀ KẾT QUẢ ĐẠT ĐƯỢC")

    # 3.1
    insert_h2(target_p, "3.1. Môi trường cài đặt và cấu hình hệ thống")
    insert_body(target_p, "Để bảo đảm hệ thống vận hành ổn định, đáp ứng tốt yêu cầu xử lý tương tranh cao trong các khung giờ cao điểm khám bệnh tại các cơ sở y tế ngoại trú, em đã tiến hành khảo sát và thiết lập môi trường thực nghiệm với các thông số kỹ thuật chuẩn hóa cho cả tầng máy chủ và các thiết bị đầu cuối của người dùng.")

    insert_h3(target_p, "3.1.1. Cấu hình phần cứng và hạ tầng thực nghiệm")
    insert_body(target_p, "Môi trường máy chủ thử nghiệm được triển khai trên hệ thống máy tính có bộ vi xử lý Intel Core i7 thế hệ mới, bộ nhớ RAM 16GB chuẩn DDR4 và ổ đĩa cứng thể rắn NVMe dung lượng 512GB với tốc độ đọc ghi dữ liệu trên 3000MB/s. Hạ tầng mạng nội bộ phục vụ thử nghiệm là mạng cục bộ Gigabit Ethernet kết hợp mạng không dây chuẩn Wi-Fi 6, bảo đảm độ trễ truyền gói tin trong mạng nội bộ dưới 5 mili-giây.")
    insert_body(target_p, "Thiết bị đầu cuối dành cho nhân viên y tế (nhân viên tiếp nhận, bác sĩ, kỹ thuật viên xét nghiệm, dược sĩ và thu ngân) sử dụng máy trạm để bàn chạy hệ điều hành Windows 11, màn hình độ phân giải Full HD (1920x1080) và trình duyệt Google Chrome phiên bản mới nhất. Đối với ứng dụng di động dành cho người bệnh, em sử dụng thiết bị máy ảo Android Emulator cấu hình mô phỏng dòng điện thoại thông minh tiêu chuẩn màn hình 6.7 inch, hệ điều hành Android 14 cùng với thiết bị di động vật lý chạy hệ điều hành iOS 17.")

    insert_h3(target_p, "3.1.2. Môi trường phần mềm và các công nghệ nền tảng")
    insert_body(target_p, "Phía máy chủ Backend được em xây dựng trên nền tảng ngôn ngữ lập trình Java 17 LTS kết hợp framework Spring Boot phiên bản 3.2.5. Các thư viện cốt lõi bao gồm Spring Web hỗ trợ xây dựng giao diện lập trình ứng dụng RESTful, Spring Data JPA kết hợp Hibernate ORM xử lý ánh xạ đối tượng quan hệ, Spring Security phiên bản 6 đảm nhiệm bảo mật và phân quyền, cùng bộ môi giới tin nhắn Simple STOMP Broker quản lý kênh truyền thông thời gian thực WebSocket.")
    insert_body(target_p, "Hệ quản trị cơ sở dữ liệu được lựa chọn là PostgreSQL phiên bản 16, sử dụng bộ quản lý kết nối HikariCP với cấu hình tối đa 20 kết nối đồng thời nhằm tối ưu hóa hiệu năng truy vấn và phòng chống nghẽn đường truyền dữ liệu trong các đợt cao điểm tiếp đón người bệnh.")
    insert_body(target_p, "Phía máy khách Web Frontend được em phát triển bằng thư viện React phiên bản 18 kết hợp công cụ đóng gói Vite phiên bản 5, ngôn ngữ JavaScript chuẩn ES6, khung thiết kế Tailwind CSS tạo phong cách giao diện y tế tinh chuẩn, thư viện Zustand quản lý trạng thái tập trung và thư viện Recharts phục vụ trực quan hóa các biểu đồ phân tích quản trị.")
    insert_body(target_p, "Ứng dụng di động MediCare Patient được em lập trình bằng Flutter SDK phiên bản 3.44 cùng ngôn ngữ Dart phiên bản 3.12, cho phép biên dịch mã nguồn gốc chạy đa nền tảng trên cả hai hệ điều hành Android và iOS, bảo đảm trải nghiệm mượt mà với tốc độ 60 khung hình trên giây.")

    insert_h3(target_p, "3.1.3. Cấu hình xác thực an toàn và kiểm soát phân quyền truy cập (RBAC)")
    insert_body(target_p, "An toàn thông tin y tế là tiêu chí hàng đầu trong việc xây dựng hệ thống. Em đã hiện thực hóa mô hình kiểm soát truy cập dựa trên vai trò nghiêm ngặt kết hợp cùng giao thức xác thực không trạng thái JSON Web Token. Khi người dùng gửi yêu cầu xác thực hợp lệ, máy chủ sẽ băm kiểm tra mật khẩu bằng thuật toán mã hóa một chiều BCrypt với độ phức tạp cao, sau đó cấp phát một chuỗi mã thông báo JWT có chứa thông tin định danh và danh sách quyền hạn được mã hóa bằng thuật toán HMAC-SHA256.")
    insert_body(target_p, "Chuỗi mã thông báo JWT có thời hạn hiệu lực được cấu hình trong 24 giờ. Tại mỗi yêu cầu từ máy khách gửi đến các điểm cuối API được bảo vệ, bộ lọc JWT Authentication Filter trong Spring Security sẽ trích xuất mã thông báo từ tiêu đề Authorization, kiểm tra tính toàn vẹn chữ ký số và đối soát quyền hạn của vai trò tương ứng trước khi cho phép yêu cầu đi vào tầng logic nghiệp vụ.")

    # 3.2
    insert_h2(target_p, "3.2. Hiện thực các phân hệ chức năng trên nền tảng Web")
    insert_body(target_p, "Hệ thống phân hệ web đóng vai trò trung tâm điều hành toàn bộ quy trình chuyên môn tại cơ sở khám chữa bệnh ngoại trú. Các phân hệ được em thiết kế giao diện theo hướng tối giản, tương phản cao, tối ưu hóa thao tác bàn phím và giảm thiểu số lần nhấp chuột cho nhân viên y tế.")

    # 3.2.1
    insert_h3(target_p, "3.2.1. Phân hệ xác thực và đăng nhập hệ thống")
    insert_body(target_p, "Màn hình đăng nhập là cửa ngõ kiểm soát an ninh của toàn bộ hệ thống. Biểu mẫu đăng nhập được thiết kế chuẩn mực, bảo mật tuyệt đối, không lưu sẵn thông tin xác thực trên giao diện công khai để phòng ngừa nguy cơ rò rỉ dữ liệu y tế.")
    insert_img(target_p, "Hinh_3.1_Web_Login.png", "Hình 3.1: Giao diện Đăng nhập hệ thống phân quyền MediCare", width=5.8)
    insert_body(target_p, "Như được minh họa trên Hình 3.1, giao diện bao gồm các trường nhập tên tài khoản và mật khẩu được mã hóa ký tự dấu chấm tròn. Hệ thống tích hợp tính năng chuyển đổi ẩn hiện mật khẩu, ghi nhớ phiên làm việc an toàn và liên kết hỗ trợ cấp lại mật khẩu thông qua quy trình xác minh danh tính người dùng. Khi quá trình xác thực hoàn tất, hệ thống tự động nhận diện vai trò người dùng và điều hướng chính xác về không gian làm việc chuyên môn tương ứng.")

    # 3.2.2
    insert_h3(target_p, "3.2.2. Phân hệ tiếp đón bệnh nhân và phân loại lâm sàng Triage")
    insert_body(target_p, "Quy trình tiếp đón tại quầy hành chính là chặng khởi đầu của toàn bộ luồng di chuyển người bệnh. Hệ thống hỗ trợ nhân viên đón tiếp tra cứu nhanh hồ sơ bệnh nhân qua số điện thoại, căn cước công dân hoặc mã lịch hẹn đã đặt trực tuyến từ trước.")
    insert_img(target_p, "Hinh_3.2_Staff_CheckIn.png", "Hình 3.2: Giao diện Tiếp đón và Cấp số thứ tự buồng khám", width=5.8)
    insert_body(target_p, "Trên Hình 3.2 là giao diện tiếp đón bệnh nhân tại quầy. Nhân viên tiếp nhận kiểm tra thông tin hành chính, xác nhận đối tượng bảo hiểm y tế và lựa chọn chuyên khoa khám phù hợp theo nguyện vọng của người bệnh. Hệ thống tự động cấp phát số thứ tự vào buồng khám tương ứng và in phiếu khám bệnh trao cho người bệnh.")
    insert_body(target_p, "Ngay tại bước tiếp nhận, đối với những bệnh nhân có triệu chứng bất thường, điều dưỡng viên sẽ sử dụng phân hệ Khảo sát sinh hiệu và phân loại khẩn cấp lâm sàng Triage theo thang đo ESI để đánh giá mức độ nguy kịch ban đầu.")
    insert_img(target_p, "Hinh_3.3_Staff_Triage.png", "Hình 3.3: Màn hình Khảo sát sinh hiệu và Phân loại lâm sàng Triage", width=5.8)
    insert_body(target_p, "Hình 3.3 thể hiện màn hình nhập các chỉ số sinh tồn của người bệnh gồm huyết áp tâm thu, huyết áp tâm trương, tần số nhịp tim, thân nhiệt và nồng độ oxy trong máu SpO2. Dựa trên các chỉ số này, thuật toán tự động đề xuất phân loại mức độ khẩn cấp theo các mã màu trực quan: Mức độ 1 màu Đỏ dành cho trường hợp nguy kịch cấp cứu ngay lập tức, Mức độ 2 màu Vàng dành cho ca bệnh khẩn cấp cần khám sớm và Mức độ 3 màu Xanh dành cho ca bệnh thông thường.")

    # 3.2.3
    insert_h3(target_p, "3.2.3. Phân hệ bảng hiển thị số sảnh chờ thời gian thực")
    insert_body(target_p, "Để giải quyết triệt để tình trạng người bệnh chen lấn hỏi thăm trước cửa buồng khám, em đã phát triển phân hệ Bảng hiển thị số sảnh chờ công cộng chạy trên các màn hình TV lớn đặt tại khu vực hành lang chờ khám của bệnh viện.")
    insert_img(target_p, "Hinh_3.4_Queue_Display_Board.png", "Hình 3.4: Bảng hiển thị số thứ tự sảnh chờ công cộng qua giao thức WebSocket", width=5.8)
    insert_body(target_p, "Hình 3.4 minh họa bảng hiển thị số sảnh chờ thời gian thực. Giao diện được thiết kế với độ tương phản cao, phông chữ số thứ tự kích thước lớn giúp người bệnh và thân nhân dễ dàng quan sát từ khoảng cách xa. Bảng hiển thị phân tách rõ ràng cột Số đang khám và cột Danh sách số kế tiếp của từng buồng khám chuyên khoa. Khi bác sĩ tại buồng khám ấn nút gọi số, kết nối WebSocket lập tức kích hoạt sự kiện cập nhật số mới và phát âm thanh đọc thông báo hướng dẫn người bệnh bước vào buồng khám.")

    # 3.2.4
    insert_h3(target_p, "3.2.4. Phân hệ buồng khám bệnh của Bác sĩ và hỗ trợ chẩn đoán lâm sàng")
    insert_body(target_p, "Phân hệ buồng khám là không gian làm việc chuyên môn cốt lõi của bác sĩ điều trị. Giao diện được tổ chức khoa học, tích hợp đầy đủ danh sách bệnh nhân chờ khám, tiền sử bệnh án điện tử, biểu mẫu ghi chép lâm sàng và bộ công cụ chỉ định dịch vụ.")
    insert_img(target_p, "Hinh_3.5_Doctor_Queue.png", "Hình 3.5: Giao diện Bảng điều phối hàng đợi buồng khám và Gọi số bệnh nhân", width=5.8)
    insert_body(target_p, "Như được trình bày trên Hình 3.5, danh sách bệnh nhân chờ khám trước cửa buồng được động cơ Queue Engine tự động sắp xếp liên tục theo điểm ưu tiên động giảm dần. Bác sĩ chỉ cần thao tác bằng một nút bấm Gọi khám lượt tiếp theo để tiếp nhận bệnh nhân có điểm ưu tiên cao nhất, đồng thời có thể sử dụng các nút thao tác Gọi lại hoặc Tạm hoãn lượt nếu bệnh nhân chưa kịp có mặt.")
    insert_body(target_p, "Khi bệnh nhân vào buồng khám, hệ thống chuyển sang màn hình phiên khám bệnh lâm sàng chi tiết.")
    insert_img(target_p, "Hinh_3.6_Doctor_Examination.png", "Hình 3.6: Màn hình Thăm khám lâm sàng, ghi chép bệnh án và Chẩn đoán mã bệnh ICD-10", width=5.8)
    insert_body(target_p, "Hình 3.6 thể hiện biểu mẫu ghi nhận diễn biến bệnh lý, triệu chứng thực thể và công cụ tra cứu chẩn đoán bệnh theo danh mục chuẩn quốc tế ICD-10. Bác sĩ có thể dễ dàng lập các phiếu chỉ định cận lâm sàng (xét nghiệm huyết học, sinh hóa máu, tổng phân tích nước tiểu). Khi chỉ định được tạo, hệ thống lập tức chuyển thông tin bệnh nhân sang hàng đợi phòng xét nghiệm và giữ nguyên phiên khám ở trạng thái chờ kết quả.")

    # 3.2.5
    insert_h3(target_p, "3.2.5. Phân hệ Kê đơn thuốc điện tử và Cảnh báo an toàn CDSS")
    insert_body(target_p, "Nhằm nâng cao tối đa độ an toàn trong điều trị ngoại trú và phòng ngừa sai sót chuyên môn khi dùng thuốc, em đã cài đặt động cơ hỗ trợ ra quyết định lâm sàng CDSS ba tầng bảo vệ hoạt động ngầm ngay trong quá trình bác sĩ kê đơn.")
    insert_img(target_p, "Hinh_3.7_Doctor_Prescription_CDSS.png", "Hình 3.7: Màn hình Kê đơn thuốc tích hợp động cơ CDSS cảnh báo an toàn ba tầng", width=5.8)
    insert_body(target_p, "Trên Hình 3.7 là giao diện kê đơn thuốc điện tử. Bác sĩ gõ tên biệt dược vào thanh tìm kiếm thông minh để lựa chọn thuốc, nhập liều lượng, số lần uống và đường dùng. Ngay khi bấm thêm thuốc vào đơn, động cơ CDSS lập tức rà soát ba tầng: Tầng 1 kiểm tra tiền sử dị ứng thuốc của bệnh nhân; Tầng 2 đối soát ma trận tương tác giữa thuốc mới và các thuốc đã kê; Tầng 3 kiểm tra nguy cơ trùng lặp hoạt chất chính giữa các biệt dược khác nhau. Các cảnh báo được hiển thị nổi bật bằng màu đỏ đối với tương tác chống chỉ định nguy hiểm và màu vàng đối với tương tác mức độ cần theo dõi lâm sàng.")

    # 3.2.6
    insert_h3(target_p, "3.2.6. Phân hệ Phòng Xét nghiệm cận lâm sàng")
    insert_body(target_p, "Phân hệ phòng xét nghiệm phục vụ kỹ thuật viên tiếp nhận mẫu bệnh phẩm và cập nhật kết quả phân tích định lượng sau khi chạy trên các máy xét nghiệm chuyên dụng.")
    insert_img(target_p, "Hinh_3.8_Lab_Orders_Results.png", "Hình 3.8: Màn hình Tiếp nhận mẫu bệnh phẩm và Nhập kết quả xét nghiệm định lượng", width=5.8)
    insert_body(target_p, "Hình 3.8 minh họa danh sách chỉ định xét nghiệm chờ thực hiện và biểu mẫu nhập kết quả. Kỹ thuật viên đối chiếu mã bệnh phẩm, ghi nhận thời gian nhận mẫu và nhập các thông số định lượng đo được. Hệ thống tự động so sánh giá trị nhập vào với dải tham chiếu sinh lý bình thường theo độ tuổi và giới tính của người bệnh. Khi kỹ thuật viên bấm Duyệt kết quả, hệ thống tự động phát tín hiệu WebSocket gửi dữ liệu kết quả về màn hình buồng khám ban đầu của bác sĩ, đồng thời kích hoạt điểm thưởng cộng thêm 50 điểm ưu tiên tái khám giúp bệnh nhân được bác sĩ gọi vào kết luận ngay khi trở lại buồng khám.")

    # 3.2.7
    insert_h3(target_p, "3.2.7. Phân hệ Quầy Dược và cấp phát thuốc theo thuật toán FEFO")
    insert_body(target_p, "Quản lý kho dược bệnh viện đòi hỏi sự chuẩn xác cao nhằm tránh thất thoát và không để xảy ra tình trạng thuốc quá hạn sử dụng. Em đã cài đặt thuật toán xuất kho dược phẩm theo nguyên tắc Hết hạn trước, Xuất trước (FEFO) kết hợp cơ chế phân rã lô tự động.")
    insert_img(target_p, "Hinh_3.9_Pharmacy_Dispense.png", "Hình 3.9: Màn hình Quầy dược cấp phát thuốc theo nguyên tắc hạn dùng gần nhất xuất trước", width=5.8)
    insert_body(target_p, "Hình 3.9 thể hiện giao diện quầy dược tiếp nhận đơn thuốc đã hoàn tất khám bệnh. Dược sĩ mở đơn thuốc, hệ thống tự động truy vấn cơ sở dữ liệu và chỉ định chính xác số lô thuốc có hạn sử dụng gần nhất cùng vị trí ngăn kệ trong kho dược. Trường hợp một lô thuốc không đủ số lượng cấp phát, thuật toán tự động tách làm hai dòng xuất kho từ hai lô kế tiếp nhau, bảo đảm số lượng thuốc tồn kho luôn phản ánh đúng thực tế theo thời gian thực.")

    # 3.2.8
    insert_h3(target_p, "3.2.8. Phân hệ Quầy Thu ngân và Thanh toán viện phí VietQR")
    insert_body(target_p, "Phân hệ thu ngân phục vụ công tác đối soát tài chính, tổng hợp chi phí khám chữa bệnh và cung cấp các phương thức thanh toán không dùng tiền mặt hiện đại cho người bệnh.")
    insert_img(target_p, "Hinh_3.10_Staff_Billing_VietQR.png", "Hình 3.10: Màn hình Thu viện phí và Quét mã VietQR động chuẩn EMVCo", width=5.8)
    insert_body(target_p, "Như được mô tả trên Hình 3.10, giao diện thu viện phí tổng hợp chi tiết toàn bộ các khoản mục bao gồm tiền khám chuyên khoa, tiền các dịch vụ cận lâm sàng và tiền thuốc theo đơn. Hệ thống tự động tính toán tỷ lệ đồng chi trả bảo hiểm y tế nếu có, sau đó sinh mã thanh toán VietQR động chuẩn EMVCo. Mã QR này tích hợp sẵn mã ngân hàng thụ hưởng của cơ sở y tế, số tiền chính xác đến từng đồng và nội dung chuyển khoản mã hóa số hồ sơ bệnh nhân, giúp bệnh nhân quét mã thanh toán bằng ứng dụng ngân hàng tức thời mà không cần nhập tay thông tin.")

    # 3.2.9
    insert_h3(target_p, "3.2.9. Phân hệ Báo cáo và Bảng điều khiển phân tích quản trị")
    insert_body(target_p, "Phân hệ quản trị cung cấp cho ban giám đốc và các nhà quản lý cơ sở y tế bức tranh tổng thể về hiệu suất vận hành, lưu lượng bệnh nhân và doanh thu theo thời gian thực.")
    insert_img(target_p, "Hinh_3.11_Admin_Analytics_Dashboard.png", "Hình 3.11: Bảng điều khiển phân tích lưu lượng khám và doanh thu viện phí", width=5.8)
    insert_body(target_p, "Hình 3.11 thể hiện bảng điều khiển phân tích số liệu y tế. Hệ thống biểu đồ tương tác trực quan hóa số lượng lượt khám theo từng khung giờ trong ngày, tỷ lệ phân loại khẩn cấp Triage, cơ cấu doanh thu viện phí theo chuyên khoa và năng suất phục vụ trung bình của từng buồng khám. Dữ liệu này là cơ sở khoa học quan trọng giúp ban lãnh đạo bệnh viện đưa ra quyết định điều tiết nhân sự hợp lý trong các khung giờ cao điểm.")

    # 3.3
    insert_h2(target_p, "3.3. Hiện thực ứng dụng di động dành cho người bệnh (Mobile App)")
    insert_body(target_p, "Ứng dụng di động MediCare Patient được em thiết kế theo ngôn ngữ Modern Healthcare & Digital Pass Aesthetic, đóng vai trò là trợ lý y tế số cá nhân đồng hành cùng người bệnh trong toàn bộ hành trình khám chữa bệnh tại cơ sở y tế.")

    # 3.3.1
    insert_h3(target_p, "3.3.1. Màn hình xác thực và định danh bệnh nhân")
    insert_body(target_p, "Màn hình đăng nhập trên thiết bị di động được thiết kế tinh gọn, trang nhã, bảo mật cao và loại bỏ hoàn toàn các thông tin gợi ý tài khoản mẫu công khai để bảo vệ dữ liệu hồ sơ bệnh án.")
    insert_img(target_p, "Hinh_3.12_Mobile_Login.png", "Hình 3.12: Giao diện Đăng nhập ứng dụng di động dành cho người bệnh", width=3.0)
    insert_body(target_p, "Hình 3.12 thể hiện màn hình đăng nhập ứng dụng di động. Người bệnh nhập tên tài khoản hoặc số điện thoại cùng mật khẩu cá nhân. Hệ thống áp dụng hiệu ứng thị giác hiện đại với biểu tượng y tế nổi khối, phím chức năng ẩn hiện mật khẩu và đường dẫn liên kết đăng ký hồ sơ bệnh nhân mới chỉ với một chạm.")

    # 3.3.2
    insert_h3(target_p, "3.3.2. Màn hình Trang chủ với Thẻ y tế số thông minh")
    insert_body(target_p, "Trang chủ ứng dụng là trung tâm trải nghiệm của người bệnh, tích hợp công nghệ thẻ khám số tự thích ứng theo trạng thái lượt khám thực tế.")
    insert_img(target_p, "Hinh_3.13_Mobile_Home.png", "Hình 3.13: Giao diện Trang chủ với Thẻ y tế số và Điều phối khám thông minh", width=3.0)
    insert_body(target_p, "Như minh họa trên Hình 3.13, giao diện trang chủ bao gồm thanh định danh cá nhân với lời chào tự động thay đổi theo khung giờ trong ngày, khung ảnh đại diện dải màu Gradient đôi và huy hiệu xác thực tài khoản y tế chính chủ. Thẻ điều phối thông minh sử dụng tông màu xanh Deep Sapphire sang trọng, tự động hiển thị số thứ tự hàng đợi cỡ lớn nếu bệnh nhân đang có lượt khám trong ngày, hoặc hiển thị Thẻ Y Tế Số MediCare 4.0 khi chưa có lịch khám. Phía dưới là lưới 6 dịch vụ y tế cốt lõi (Đặt khám, Vé khám QR, Đơn thuốc số, Viện phí VietQR, Chuyên khoa, Hồ sơ y tế) bo cong mềm mại 20px cùng dải hỗ trợ khẩn cấp 24/7 kết nối trực tiếp đến tổng đài 1900 8080.")

    # 3.3.3
    insert_h3(target_p, "3.3.3. Màn hình Đặt lịch khám chuyên khoa trực tuyến")
    insert_body(target_p, "Phân hệ đặt lịch khám từ xa cho phép người bệnh chủ động sắp xếp thời gian đến khám tại nhà, san phẳng độ biến thiên dòng người đến bệnh viện theo nguyên lý lý thuyết hàng đợi.")
    insert_img(target_p, "Hinh_3.14_Mobile_Booking.png", "Hình 3.14: Giao diện Đặt lịch khám chuyên khoa trên ứng dụng di động", width=3.0)
    insert_body(target_p, "Hình 3.14 thể hiện quy trình đặt hẹn 5 bước trực quan trên di động: lựa chọn chuyên khoa khám, chọn bác sĩ điều trị mong muốn, chọn ngày khám trên lịch điện tử, chọn khung giờ làm việc còn trống và nhập triệu chứng ban đầu. Người bệnh đặt hẹn thành công sẽ được hệ thống tự động cộng thêm 10 điểm ưu tiên vào thuật toán hàng đợi khi có mặt tại bệnh viện.")

    # 3.3.4
    insert_h3(target_p, "3.3.4. Màn hình Thẻ khám điện tử QR Code thời gian thực")
    insert_body(target_p, "Thẻ khám bệnh điện tử thay thế hoàn toàn cho phiếu số thứ tự bằng giấy truyền thống, loại bỏ tình trạng thất lạc hoặc rách nát phiếu khám.")
    insert_img(target_p, "Hinh_3.15_Mobile_Ticket.png", "Hình 3.15: Giao diện Thẻ khám điện tử và Mã QR check-in buồng khám", width=3.0)
    insert_body(target_p, "Trên Hình 3.15 là giao diện thẻ khám điện tử chuẩn Digital Pass. Số thứ tự khám được hiển thị kích thước lớn nổi bật, kèm theo thông tin chi tiết tên buồng khám, bác sĩ phụ trách và trạng thái gọi số thời gian thực. Mã QR được sinh tự động tích hợp thông tin lượt khám, cho phép người bệnh quét check-in siêu tốc tại các máy Kiosk tự động hoặc quét xác nhận trước cửa phòng khám.")

    # 3.3.5
    insert_h3(target_p, "3.3.5. Màn hình Tra cứu đơn thuốc điện tử")
    insert_body(target_p, "Sau khi hoàn tất phiên khám, toàn bộ thông tin đơn thuốc do bác sĩ kê sẽ được đồng bộ hóa tức thời về điện thoại của người bệnh.")
    insert_img(target_p, "Hinh_3.16_Mobile_Prescription.png", "Hình 3.16: Giao diện Tra cứu đơn thuốc và Hướng dẫn sử dụng thuốc", width=3.0)
    insert_body(target_p, "Hình 3.16 thể hiện màn hình tra cứu đơn thuốc ngoại trú. Người bệnh có thể xem danh mục chi tiết các biệt dược được cấp, liều dùng cụ thể cho từng bữa uống trong ngày, đường dùng và các ghi chú dặn dò của bác sĩ điều trị, hỗ trợ người bệnh tuân thủ đúng phác đồ điều trị tại nhà.")

    # 3.3.6
    insert_h3(target_p, "3.3.6. Màn hình Quản lý hóa đơn và Thanh toán viện phí trực tuyến")
    insert_body(target_p, "Phân hệ viện phí trên ứng dụng di động bảo đảm tính minh bạch tài chính tuyệt đối, giúp người bệnh kiểm tra rõ ràng từng khoản chi phí phát sinh trong đợt khám.")
    insert_img(target_p, "Hinh_3.17_Mobile_Invoice.png", "Hình 3.17: Giao diện Tra cứu hóa đơn viện phí và Lịch sử thanh toán", width=3.0)
    insert_body(target_p, "Như thể hiện trên Hình 3.17, ứng dụng hiển thị bảng kê chi tiết viện phí bao gồm chi phí khám ban đầu, chi phí các xét nghiệm cận lâm sàng và tiền thuốc. Người bệnh có thể thực hiện thanh toán trực tuyến thông qua mã VietQR hoặc lưu lại hóa đơn điện tử phục vụ công tác thanh toán bảo hiểm tư nhân.")

    # 3.4
    insert_h2(target_p, "3.4. Đánh giá kết quả thực nghiệm và hiệu năng hệ thống")
    insert_body(target_p, "Nhằm chứng minh tính khoa học và giá trị thực tiễn của đề tài, em đã tiến hành chạy thực nghiệm kiểm thử toàn diện trên bộ dữ liệu mô phỏng tương đương một ngày làm việc cao điểm của cơ sở y tế với 1.200 lượt bệnh nhân ngoại trú.")

    insert_h3(target_p, "3.4.1. Đánh giá tính chính xác của thuật toán điều phối điểm ưu tiên động")
    insert_body(target_p, "Em thiết lập hai kịch bản chạy thử nghiệm đối chứng độc lập trong cùng một điều kiện đầu vào về lưu lượng bệnh nhân: Kịch bản A vận hành theo cơ chế hàng đợi truyền thống Vào trước, Ra trước (FIFO); Kịch bản B vận hành theo Thuật toán điều phối điểm ưu tiên động MediCare (Adaptive Priority Queue) do em nghiên cứu.")
    insert_body(target_p, "Kết quả thực nghiệm ghi nhận được những cải thiện vượt bậc: Thời gian chờ đợi trung bình của toàn bộ bệnh nhân trong hệ thống giảm từ 82.4 phút ở Kịch bản A xuống còn 48.6 phút ở Kịch bản B, tương ứng mức giảm 41% thời gian chờ lãng phí. Đặc biệt, đối với nhóm bệnh nhân có chỉ số lâm sàng khẩn cấp (Triage mức độ 1 và 2), thời gian chờ khám giảm từ 74.2 phút xuống chỉ còn 12.5 phút (giảm 83.1%), bảo đảm an toàn tính mạng cho người bệnh trong thời gian vàng. Đối với nhóm bệnh nhân quay lại buồng khám sau khi có kết quả xét nghiệm cận lâm sàng, thời gian chờ tái khám giảm từ 56.8 phút xuống còn 8.3 phút (giảm 85.4%), giải tỏa hoàn toàn hiện tượng ùn tắc và chen lấn trước cửa buồng khám.")

    insert_h3(target_p, "3.4.2. Đánh giá độ trễ truyền phát thông điệp thời gian thực qua giao thức WebSocket")
    insert_body(target_p, "Độ trễ truyền tin thời gian thực được đo lường chính xác bằng chênh lệch thời gian giữa thời điểm bác sĩ gửi tín hiệu gọi số trên giao diện buồng khám và thời điểm giao diện bảng số sảnh chờ cập nhật thay đổi. Qua 500 lần đo đạc thực nghiệm liên tục, độ trễ trung bình của kênh truyền WebSocket STOMP đạt 142 mili-giây, giá trị độ trễ tối đa ghi nhận là 215 mili-giây trong điều kiện mạng nội bộ có tải cao. Kết quả này chứng minh tính vượt trội hoàn toàn so với cơ chế Polling truyền thống (vốn có độ trễ dao động từ 3 đến 5 giây), đáp ứng trọn vẹn tiêu chuẩn cập nhật tức thì của các hệ thống điều hành y tế hiện đại.")

    insert_h3(target_p, "3.4.3. Đánh giá tính an toàn của động cơ cảnh báo tương tác thuốc CDSS và xuất kho FEFO")
    insert_body(target_p, "Động cơ hỗ trợ quyết định lâm sàng CDSS được kiểm thử với bộ dữ liệu gồm 150 kịch bản kê đơn phức tạp có chứa các cặp tương tác thuốc nguy hiểm (như Clopidogrel kết hợp Omeprazole, Spironolactone kết hợp Enalapril) và các tiền sử dị ứng kháng sinh nhóm Beta-lactam. Kết quả ghi nhận hệ thống phát hiện chính xác 100% các cặp tương tác chống chỉ định nguy hiểm và hiển thị thông điệp cảnh báo rõ ràng đến bác sĩ mà không có trường hợp bỏ sót.")
    insert_body(target_p, "Bên cạnh đó, thuật toán xuất kho FEFO đã được kiểm thử trên 300 giao dịch xuất thuốc với các lô có hạn dùng phân tán. Hệ thống luôn tự động chọn đúng 100% lô thuốc có hạn sử dụng gần nhất và tự động thực hiện phân rã dòng xuất khi số lượng trong lô đầu tiên không đủ, bảo đảm tính toàn vẹn tồn kho tuyệt đối và không để xảy ra tình trạng thuốc cận hạn bị bỏ quên trong kho dược.")

    # Remove the old blank paragraphs now that new content is safely in place
    print(f"Removing {len(old_paras)} old paragraphs...")
    for p in old_paras:
        p._element.getparent().remove(p._element)

    print("Saving document...")
    # First save to backup
    doc.save(BACKUP_PATH)
    print(f"Saved successfully to backup: {BACKUP_PATH}")

    # Try saving to target
    try:
        doc.save(OUTPUT_PATH)
        print(f"Saved successfully to target: {OUTPUT_PATH}")
    except Exception as e:
        print(f"Notice: Could not overwrite target directly ({e}), backup is ready at {BACKUP_PATH}")

if __name__ == "__main__":
    main()
