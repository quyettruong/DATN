# -*- coding: utf-8 -*-
import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

SOURCE_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Ban_Chinh_Thuc_Chuong_3.docx"
OUTPUT_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Ban_Chuan_Chuong_3.docx"
FINAL_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuan_Hoa_Moi_Nhat.docx"
IMG_DIR = r"C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images"

def format_run(run, font_name="Times New Roman", size_pt=13, bold=False, italic=False, color=RGBColor(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is not None:
        rFonts.set(qn('w:ascii'), font_name)
        rFonts.set(qn('w:hAnsi'), font_name)
        rFonts.set(qn('w:cs'), font_name)
        rFonts.set(qn('w:eastAsia'), font_name)

def create_para(doc, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size_pt=13, space_before=3, space_after=6, line_spacing=1.3, indent=True):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if indent and align == WD_ALIGN_PARAGRAPH.JUSTIFY:
        p.paragraph_format.first_line_indent = Inches(0.5)
    else:
        p.paragraph_format.first_line_indent = Inches(0)
    
    if text:
        run = p.add_run(text)
        format_run(run, bold=bold, italic=italic, size_pt=size_pt)
    return p

def create_image_para(doc, img_name, is_mobile=False):
    img_path = os.path.join(IMG_DIR, img_name)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.first_line_indent = Inches(0)
    
    width = Inches(2.9) if is_mobile else Inches(6.0)
    p.add_run().add_picture(img_path, width=width)
    return p

def create_caption_para(doc, caption_text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.first_line_indent = Inches(0)
    
    run = p.add_run(caption_text)
    format_run(run, bold=True, italic=False, size_pt=13)
    return p

def build_chapter_3_elements(temp_doc):
    elements = []
    
    def h1(txt):
        p = create_para(temp_doc, txt, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size_pt=14, space_before=18, space_after=12, indent=False)
        elements.append(p._p)
        
    def h2(txt):
        p = create_para(temp_doc, txt, align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size_pt=13, space_before=14, space_after=6, indent=False)
        elements.append(p._p)

    def h3(txt):
        p = create_para(temp_doc, txt, align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size_pt=13, space_before=10, space_after=4, indent=False)
        elements.append(p._p)

    def body(txt):
        p = create_para(temp_doc, txt, align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, size_pt=13, space_before=3, space_after=6, line_spacing=1.3, indent=True)
        elements.append(p._p)

    def img_with_cap(img_name, cap_text, is_mobile=False):
        p_img = create_image_para(temp_doc, img_name, is_mobile=is_mobile)
        elements.append(p_img._p)
        p_cap = create_caption_para(temp_doc, cap_text)
        elements.append(p_cap._p)

    # ------------------ CHƯƠNG 3 ------------------
    h1("CHƯƠNG 3: CÀI ĐẶT THỰC NGHIỆM")
    
    # 3.1
    h2("3.1. Môi trường cài đặt và cấu hình dự án")
    body("Phần này mô tả quá trình thiết lập môi trường phát triển và cấu hình các thành phần công nghệ cho hệ thống hỗ trợ quản lý và điều phối quy trình khám bệnh ngoại trú MediCare. Để bảo đảm hệ thống vận hành ổn định, đáp ứng tốt yêu cầu xử lý tương tranh cao trong các khung giờ cao điểm khám bệnh tại các cơ sở y tế, em đã tiến hành khảo sát và thiết lập môi trường thực nghiệm với các thông số kỹ thuật chuẩn hóa cho cả tầng máy chủ và các thiết bị đầu cuối của người dùng.")
    body("Môi trường máy chủ thử nghiệm được triển khai trên hệ thống máy tính có bộ vi xử lý Intel Core i7 thế hệ mới, bộ nhớ RAM 16GB chuẩn DDR4 và ổ đĩa cứng thể rắn NVMe dung lượng 512GB với tốc độ đọc ghi dữ liệu trên 3000MB/s. Hạ tầng mạng nội bộ phục vụ thử nghiệm là mạng cục bộ Gigabit Ethernet kết hợp mạng không dây chuẩn Wi-Fi 6, bảo đảm độ trễ truyền gói tin trong mạng nội bộ dưới 5 mili-giây.")
    body("Thiết bị đầu cuối dành cho nhân viên y tế gồm nhân viên tiếp nhận, bác sĩ buồng khám, kỹ thuật viên xét nghiệm, dược sĩ quầy thuốc và thu ngân viện phí sử dụng máy trạm để bàn chạy hệ điều hành Windows 11, màn hình độ phân giải Full HD (1920x1080) và trình duyệt Google Chrome phiên bản mới nhất. Đối với ứng dụng di động dành cho người bệnh, em sử dụng thiết bị máy ảo Android Emulator cấu hình mô phỏng dòng điện thoại thông minh tiêu chuẩn màn hình 6.7 inch, hệ điều hành Android 14 cùng với thiết bị di động vật lý chạy hệ điều hành iOS 17.")
    body("Phía máy chủ Backend được em xây dựng trên nền tảng ngôn ngữ lập trình Java 17 LTS kết hợp framework Spring Boot phiên bản 3.2.5. Các thư viện cốt lõi bao gồm Spring Web hỗ trợ xây dựng giao diện lập trình ứng dụng RESTful, Spring Data JPA kết hợp Hibernate ORM xử lý ánh xạ đối tượng quan hệ, Spring Security phiên bản 6 đảm nhiệm bảo mật và phân quyền truy cập, cùng bộ môi giới tin nhắn Simple STOMP Broker quản lý kênh truyền thông thời gian thực WebSocket. Hệ quản trị cơ sở dữ liệu được lựa chọn là PostgreSQL phiên bản 16, sử dụng bộ quản lý kết nối HikariCP với cấu hình tối đa 20 kết nối đồng thời nhằm tối ưu hóa hiệu năng truy vấn và phòng chống nghẽn đường truyền dữ liệu trong các đợt cao điểm tiếp đón người bệnh.")
    body("Phía máy khách Web Frontend được em phát triển bằng thư viện React phiên bản 18 kết hợp công cụ đóng gói Vite phiên bản 5, ngôn ngữ JavaScript chuẩn ES6, khung thiết kế Tailwind CSS tạo phong cách giao diện y tế tinh chuẩn, thư viện Zustand quản lý trạng thái tập trung và thư viện Recharts phục vụ trực quan hóa các biểu đồ phân tích quản trị. Ứng dụng di động MediCare Patient được em lập trình bằng Flutter SDK phiên bản 3.44 cùng ngôn ngữ Dart phiên bản 3.12, cho phép biên dịch mã nguồn gốc chạy đa nền tảng trên cả hai hệ điều hành Android và iOS, bảo đảm trải nghiệm mượt mà với tốc độ 60 khung hình trên giây.")
    body("Về an toàn thông tin và kiểm soát truy cập, em đã hiện thực hóa mô hình kiểm soát truy cập dựa trên vai trò nghiêm ngặt kết hợp cùng giao thức xác thực không trạng thái JSON Web Token. Khi người dùng gửi yêu cầu xác thực hợp lệ, máy chủ sẽ băm kiểm tra mật khẩu bằng thuật toán mã hóa một chiều BCrypt với độ phức tạp cao, sau đó cấp phát một chuỗi mã thông báo JWT có chứa thông tin định danh và danh sách quyền hạn được mã hóa bằng thuật toán HMAC-SHA256 với thời hạn hiệu lực cấu hình trong 24 giờ. Tại mỗi yêu cầu từ máy khách gửi đến các điểm cuối API được bảo vệ, bộ lọc JWT Authentication Filter trong Spring Security sẽ trích xuất mã thông báo từ tiêu đề Authorization, kiểm tra tính toàn vẹn chữ ký số và đối soát quyền hạn của vai trò tương ứng trước khi cho phép yêu cầu đi vào tầng logic nghiệp vụ.")

    # 3.2
    h2("3.2. Cài đặt các module chức năng")
    body("Quá trình lập trình và hiện thực hóa hệ thống được em chia thành nhiều module chức năng chuyên biệt, giúp việc phát triển, kiểm thử độc lập và mở rộng quy mô đạt hiệu quả cao nhất:")
    body("Module 1: Quản lý xác thực và Phân quyền người dùng\n"
         "Chức năng: Đăng ký, đăng nhập hệ thống, kiểm soát phân quyền dựa trên vai trò cho 7 nhóm người dùng gồm Bệnh nhân, Nhân viên tiếp đón, Bác sĩ khám bệnh, Kỹ thuật viên xét nghiệm, Dược sĩ quầy thuốc, Nhân viên thu ngân và Quản trị viên hệ thống.\n"
         "Công nghệ: Spring Boot Security 6, Stateless JWT Token, BCrypt Password Encoder, React Router Guard, Flutter Secure Storage.\n"
         "Database: Bảng users quản lý thông tin tài khoản và vai trò phân quyền.")
    body("Module 2: Cổng thông tin và Ứng dụng di động người bệnh\n"
         "Chức năng: Cung cấp giao diện tra cứu thông tin y tế, danh mục chuyên khoa, lịch làm việc của bác sĩ, đăng ký tài khoản bệnh nhân, đặt lịch khám bệnh trực tuyến, cấp thẻ y tế số điện tử và tra cứu tiến trình khám bệnh thời gian thực.\n"
         "Công nghệ: React 18, Tailwind CSS, Flutter SDK, Dart, SharedPreferences, QR Code Generator.\n"
         "Database: Bảng patients, appointments, departments, doctors liên kết thông tin người bệnh và lịch hẹn.")
    body("Module 3: Tiếp đón và Phân loại lâm sàng Triage\n"
         "Chức năng: Tiếp nhận bệnh nhân tại quầy hành chính, quét mã thẻ y tế hoặc căn cước công dân, xác nhận đối tượng bảo hiểm, khảo sát bộ chỉ số sinh hiệu và phân loại khẩn cấp lâm sàng 5 cấp độ theo thang đo chuẩn ESI, tự động cấp phát số thứ tự buồng khám theo thuật toán ưu tiên trọng số.\n"
         "Công nghệ: React 18, RESTful API Client, Thuật toán phân luồng đa tiêu chí (MCDM/AHP).\n"
         "Database: Bảng triages, queues, vital_signs ghi nhận chỉ số sinh tồn và trạng thái tiếp đón.")
    body("Module 4: Khám bệnh và Hỗ trợ ra quyết định lâm sàng CDSS\n"
         "Chức năng: Quản lý hàng đợi buồng khám, gọi số bệnh nhân, ghi nhận quá trình thăm khám lâm sàng, chẩn đoán bệnh theo danh mục mã bệnh quốc tế ICD-10, chỉ định cận lâm sàng và kê đơn thuốc an toàn tích hợp hệ thống hỗ trợ ra quyết định lâm sàng CDSS cảnh báo tương tác thuốc và dị ứng.\n"
         "Công nghệ: React 18, Rule Engine kiểm tra tương tác thuốc hai chiều, WebSocket STOMP Client.\n"
         "Database: Bảng medical_records, prescriptions, prescription_items, icd10_catalogs, drug_interactions.")
    body("Module 5: Cận lâm sàng và Quản lý kết quả xét nghiệm\n"
         "Chức năng: Tiếp nhận chỉ định xét nghiệm từ buồng khám, đối chiếu mã bệnh phẩm, ghi nhận thời gian nhận mẫu, nhập các chỉ số định lượng sinh hóa và huyết học, tự động so sánh giá trị đo với dải tham chiếu sinh lý bình thường theo độ tuổi và giới tính để đưa ra cảnh báo cờ đỏ nguy hiểm, truyền kết quả tức thời về buồng khám ban đầu.\n"
         "Công nghệ: React 18, RESTful API, WebSocket Event Publisher.\n"
         "Database: Bảng lab_orders, lab_order_items, lab_test_catalogs.")
    body("Module 6: Quản lý kho dược và Cấp phát thuốc theo nguyên tắc FEFO\n"
         "Chức năng: Tiếp nhận đơn thuốc đã được bác sĩ ký số và bệnh nhân đã hoàn tất thanh toán, tự động gợi ý xuất các lô thuốc có hạn sử dụng gần nhất theo nguyên tắc FEFO (First Expired, First Out), hỗ trợ phân rã dòng xuất khi số lượng trong lô đầu tiên không đủ, kiểm tra tương tác thuốc lần cuối và cập nhật trừ tồn kho tự động.\n"
         "Công nghệ: React 18, Thuật toán sắp xếp và phân bổ lô hàng FEFO, Database Transaction Locking.\n"
         "Database: Bảng medicines, inventory_batches, stock_movements, dispense_orders.")
    body("Module 7: Quản lý viện phí và Thanh toán trực tuyến chuẩn VietQR\n"
         "Chức năng: Tự động tổng hợp toàn bộ chi phí phát sinh trong quy trình khám chữa bệnh gồm tiền khám, tiền xét nghiệm cận lâm sàng và tiền thuốc, bóc tách tỷ lệ chi trả của bảo hiểm y tế, tự động sinh mã VietQR động theo chuẩn Napas 247 chứa đầy đủ số tài khoản, số tiền và nội dung thanh toán để người bệnh quét mã chuyển khoản tức thời.\n"
         "Công nghệ: React 18, VietQR API Generator, IPN Webhook xử lý đối soát giao dịch tự động.\n"
         "Database: Bảng invoices, invoice_items, payment_transactions.")
    body("Module 8: Điều phối hàng đợi thông minh và Bảng gọi số sảnh chờ\n"
         "Chức năng: Quản lý danh sách hàng đợi thời gian thực, bảng hiển thị số sảnh chờ công cộng chạy trên màn hình TV lớn, tích hợp công nghệ chuyển văn bản thành giọng nói (Text-To-Speech) tự động đọc loa gọi tên và số thứ tự của bệnh nhân khi bác sĩ bấm nút gọi tại buồng khám.\n"
         "Công nghệ: Spring WebSocket STOMP Broker, SockJS, Web Speech API TTS.\n"
         "Database: Bảng queues, queue_events, departments.")
    body("Module 9: Báo cáo thống kê và Phân tích quản trị bệnh viện\n"
         "Chức năng: Báo cáo trực quan hóa các chỉ số vận hành bệnh viện gồm lưu lượng bệnh nhân theo từng khung giờ trong ngày, tỷ lệ phân bố ca bệnh theo mức độ Triage, thời gian chờ khám trung bình của từng chuyên khoa, doanh thu viện phí và hiệu suất làm việc của các buồng khám.\n"
         "Công nghệ: React 18, Thư viện biểu đồ Recharts, Spring Data Aggregate Queries.\n"
         "Database: Truy vấn tổng hợp trên các bảng medical_records, queues, invoices, triages.")

    # 3.3
    h2("3.3. Kết quả")
    body("Sau quá trình phân tích, thiết kế và lập trình hiện thực hóa toàn bộ các phân hệ theo kiến trúc hệ thống đã đề ra, em đã tiến hành triển khai thử nghiệm hệ thống MediCare trên cả nền tảng ứng dụng Web và ứng dụng Di động. Các giao diện người dùng và chức năng nghiệp vụ chuyên môn được trình bày chi tiết dưới đây:")

    # 3.3.1
    h3("3.3.1 Giao diện người dùng")
    img_with_cap("Hinh_3.1_Web_Portal_Home.png", "Hình 3.1: Giao diện Cổng thông tin người bệnh và Tra cứu y tế trực tuyến")
    body("Hình 3.1 minh họa giao diện Cổng thông tin người bệnh MediCare trên nền tảng Web. Giao diện được thiết kế hiện đại với tông màu xanh y tế chuẩn mực, cung cấp các khối thông tin tiện ích bao gồm Đặt lịch khám, Danh mục chuyên khoa, Đội ngũ bác sĩ, Hướng dẫn quy trình khám và Nút truy cập nhanh Bảng gọi số sảnh chờ TV. Người bệnh và thân nhân có thể dễ dàng tra cứu thông tin chuyên khoa, thời gian làm việc của bác sĩ và thực hiện đăng ký khám bệnh mà không cần cài đặt ứng dụng phức tạp.")

    # 3.3.2
    h3("3.3.2. Chức năng Đăng ký")
    img_with_cap("Hinh_3.2_Web_Register.png", "Hình 3.2: Giao diện Đăng ký tài khoản người bệnh")
    body("Hình 3.2 thể hiện biểu mẫu đăng ký tài khoản người bệnh trên cổng thông tin trực tuyến. Hệ thống yêu cầu cung cấp các thông tin định danh chính xác gồm họ và tên, số điện thoại, mật khẩu, căn cước công dân và ngày tháng năm sinh. Tất cả các trường dữ liệu đều được kiểm tra tính hợp lệ bằng biểu thức chính quy (Regex) ngay tại tầng giao diện trước khi gửi lên máy chủ để phòng chống tạo tài khoản ảo và trùng lặp thông tin định danh y tế.")

    # 3.3.3
    h3("3.3.3. Chức năng Đặt lịch khám bệnh trực tuyến")
    img_with_cap("Hinh_3.3_Web_Patient_Booking.png", "Hình 3.3: Giao diện Đặt lịch khám bệnh trực tuyến")
    body("Hình 3.3 minh họa quy trình đặt lịch khám bệnh trực tuyến trên nền tảng Web. Người bệnh lựa chọn chuyên khoa mong muốn (như Nội tổng quát, Tim mạch, Tai Mũi Họng, Nhi khoa), chọn bác sĩ phụ trách, ngày khám và khung giờ khám cụ thể trong ngày. Hệ thống kiểm tra số lượng vị trí còn trống trong khung giờ và tiến hành lưu trữ lịch hẹn vào cơ sở dữ liệu, đồng thời sinh mã lịch hẹn để người bệnh sử dụng khi đến tiếp đón tại bệnh viện.")

    # 3.3.4
    h3("3.3.4. Chức năng Tra cứu tiến trình và Hàng đợi khám bệnh thời gian thực")
    img_with_cap("Hinh_3.4_Web_Patient_Queue.png", "Hình 3.4: Giao diện Tra cứu tiến trình và Hàng đợi khám bệnh thời gian thực")
    body("Hình 3.4 thể hiện màn hình theo dõi tiến trình khám bệnh và trạng thái hàng đợi trực tuyến của người bệnh. Thông qua kết nối WebSocket thời gian thực, người bệnh có thể biết chính xác số thứ tự hiện tại của mình, số thứ tự đang được khám tại buồng khám, số lượng bệnh nhân còn đang chờ trước mặt và thời gian ước tính dự kiến tới lượt. Tính năng này giúp người bệnh chủ động sắp xếp thời gian di chuyển, giảm thiểu tâm lý căng thẳng và chấm dứt tình trạng tụ tập chen lấn trước cửa phòng khám.")

    # 3.3.5
    h3("3.3.5. Bảng hiển thị số thứ tự sảnh chờ công cộng qua giao thức WebSocket")
    img_with_cap("Hinh_3.5_Queue_Display_Board.png", "Hình 3.5: Bảng hiển thị số thứ tự sảnh chờ công cộng qua giao thức WebSocket")
    body("Hình 3.5 minh họa phân hệ Bảng hiển thị số sảnh chờ công cộng chạy trên các màn hình TV lớn đặt tại khu vực hành lang chờ của bệnh viện. Giao diện được thiết kế với độ tương phản cao, phông chữ kích thước lớn giúp quan sát rõ ràng từ khoảng cách xa. Bảng hiển thị phân tách rõ ràng cột Số đang khám và cột Danh sách số kế tiếp của từng buồng khám chuyên khoa. Khi bác sĩ tại buồng khám ấn nút gọi số, kết nối WebSocket lập tức kích hoạt sự kiện cập nhật số mới và phát âm thanh đọc thông báo hướng dẫn người bệnh bước vào buồng khám.")

    # 3.3.6
    h3("3.3.6. Chức năng Tiếp đón người bệnh và Cấp phát số thứ tự tự động")
    img_with_cap("Hinh_3.6_Staff_CheckIn.png", "Hình 3.6: Giao diện Tiếp đón người bệnh và Cấp phát số thứ tự tự động")
    body("Hình 3.6 thể hiện giao diện làm việc của nhân viên tiếp đón tại quầy hành chính. Nhân viên tra cứu nhanh thông tin người bệnh thông qua mã lịch hẹn trực tuyến, số căn cước công dân hoặc số điện thoại. Sau khi đối soát thông tin bảo hiểm y tế và lựa chọn chuyên khoa khám theo yêu cầu của bệnh nhân, hệ thống tự động ghi nhận lượt tiếp đón, cấp phát số thứ tự buồng khám tương ứng và in phiếu tiếp đón trao tận tay người bệnh.")

    # 3.3.7
    h3("3.3.7. Chức năng Phân loại lâm sàng Triage 5 cấp độ")
    img_with_cap("Hinh_3.7_Staff_Triage.png", "Hình 3.7: Giao diện Phân loại lâm sàng Triage 5 cấp độ")
    body("Hình 3.7 minh họa màn hình nhập các chỉ số sinh tồn của người bệnh gồm huyết áp tâm thu, huyết áp tâm trương, tần số nhịp tim, thân nhiệt và nồng độ oxy trong máu SpO2. Dựa trên các chỉ số này, thuật toán tự động đề xuất phân loại mức độ khẩn cấp theo các mã màu trực quan: Mức độ 1 màu Đỏ dành cho trường hợp nguy kịch cấp cứu ngay lập tức, Mức độ 2 màu Vàng dành cho ca bệnh khẩn cấp cần khám sớm và Mức độ 3 màu Xanh dành cho ca bệnh thông thường, giúp bác sĩ phát hiện và xử lý kịp thời các ca bệnh nặng.")

    # 3.3.8
    h3("3.3.8. Chức năng Hàng đợi khám bệnh buồng khám chuyên khoa")
    img_with_cap("Hinh_3.8_Doctor_Queue.png", "Hình 3.8: Giao diện Hàng đợi khám bệnh buồng khám chuyên khoa")
    body("Hình 3.8 minh họa giao diện hàng đợi buồng khám dành cho bác sĩ chuyên khoa. Màn hình liệt kê toàn bộ danh sách bệnh nhân đang chờ khám được sắp xếp theo đúng thứ tự ưu tiên đã tính toán. Bác sĩ chỉ cần ấn nút Gọi số kế tiếp để kích hoạt sự kiện gọi bệnh nhân vào buồng khám, đồng thời hệ thống tự động chuyển trạng thái bệnh nhân từ Đang chờ sang Đang khám và cập nhật đồng bộ lên bảng TV ngoài sảnh chờ.")

    # 3.3.9
    h3("3.3.9. Chức năng Khám bệnh và Chẩn đoán mã bệnh ICD-10")
    img_with_cap("Hinh_3.9_Doctor_Examination.png", "Hình 3.9: Giao diện Khám bệnh và Chẩn đoán mã bệnh ICD-10")
    body("Hình 3.9 thể hiện giao diện buồng khám chuyên môn của bác sĩ. Tại đây, bác sĩ theo dõi tiền sử bệnh án, ghi nhận lý do khám, triệu chứng lâm sàng và tiến hành chẩn đoán bệnh theo danh mục mã bệnh quốc tế ICD-10 chuẩn hóa. Bác sĩ có thể chỉ định cận lâm sàng (xét nghiệm máu, sinh hóa, chẩn đoán hình ảnh) hoặc chuyển thẳng sang bước kê đơn thuốc điều trị.")

    # 3.3.10
    h3("3.3.10. Chức năng Kê đơn thuốc an toàn tích hợp hệ thống hỗ trợ ra quyết định CDSS")
    img_with_cap("Hinh_3.10_Doctor_Prescription_CDSS.png", "Hình 3.10: Giao diện Kê đơn thuốc an toàn tích hợp hệ thống hỗ trợ ra quyết định CDSS")
    body("Hình 3.10 minh họa giao diện kê đơn thuốc thông minh tích hợp hệ thống hỗ trợ ra quyết định lâm sàng CDSS. Khi bác sĩ lựa chọn thuốc và liều dùng, bộ quy tắc kiểm tra tương tác thuốc sẽ tự động rà soát cặp thuốc tương tác và đối chiếu với tiền sử dị ứng thuốc của người bệnh. Nếu phát hiện nguy cơ tương tác nghiêm trọng hoặc chống chỉ định, hệ thống sẽ lập tức hiển thị cảnh báo viền đỏ nổi bật và ngăn chặn xác nhận đơn thuốc, bảo đảm an toàn tính mạng tuyệt đối cho người bệnh.")

    # 3.3.11
    h3("3.3.11. Chức năng Tiếp nhận chỉ định và Trả kết quả xét nghiệm cận lâm sàng")
    img_with_cap("Hinh_3.11_Lab_Orders_Results.png", "Hình 3.11: Giao diện Tiếp nhận chỉ định và Trả kết quả xét nghiệm cận lâm sàng")
    body("Hình 3.11 minh họa danh sách chỉ định xét nghiệm chờ thực hiện và biểu mẫu nhập kết quả cận lâm sàng. Kỹ thuật viên đối chiếu mã bệnh phẩm, ghi nhận thời gian nhận mẫu và nhập các thông số định lượng đo được. Hệ thống tự động so sánh giá trị nhập vào với dải tham chiếu sinh lý bình thường theo độ tuổi và giới tính của người bệnh. Khi kỹ thuật viên bấm Duyệt kết quả, hệ thống tự động phát tín hiệu WebSocket gửi dữ liệu kết quả về màn hình buồng khám ban đầu của bác sĩ, đồng thời kích hoạt điểm thưởng ưu tiên tái khám giúp bệnh nhân được bác sĩ gọi vào kết luận ngay khi trở lại buồng khám.")

    # 3.3.12
    h3("3.3.12. Chức năng Quầy dược cấp phát thuốc theo nguyên tắc FEFO")
    img_with_cap("Hinh_3.12_Pharmacy_Dispense.png", "Hình 3.12: Giao diện Quầy dược cấp phát thuốc theo nguyên tắc FEFO")
    body("Hình 3.12 thể hiện phân hệ quản lý quầy dược bệnh viện. Dược sĩ tiếp nhận các đơn thuốc đã được ký số và hoàn tất thủ tục thanh toán. Hệ thống tự động gợi ý xuất kho các lô thuốc có hạn sử dụng gần nhất theo nguyên tắc FEFO (First Expired, First Out) và hỗ trợ chia tách dòng xuất khi lô đầu tiên không đủ số lượng. Dược sĩ kiểm tra thông tin thuốc, hướng dẫn sử dụng cho bệnh nhân và bấm Xác nhận cấp phát để hệ thống tự động trừ tồn kho theo lô tương ứng.")

    # 3.3.13
    h3("3.3.13. Chức năng Quầy thu ngân và Thanh toán viện phí chuẩn VietQR")
    img_with_cap("Hinh_3.13_Staff_Billing_VietQR.png", "Hình 3.13: Giao diện Quầy thu ngân và Thanh toán viện phí chuẩn VietQR")
    body("Hình 3.13 minh họa giao diện quầy thu ngân viện phí. Hệ thống tự động tổng hợp toàn bộ các khoản chi phí phát sinh trong đợt khám của bệnh nhân gồm tiền khám ban đầu, tiền xét nghiệm và tiền thuốc trong đơn. Giao diện bóc tách rõ ràng phần bảo hiểm y tế chi trả và phần bệnh nhân phải nộp, đồng thời tự động sinh mã VietQR động chuẩn Napas 247 để bệnh nhân có thể quét mã chuyển khoản nhanh chóng qua ứng dụng ngân hàng.")

    # 3.3.14
    h3("3.3.14. Giao diện admin")
    img_with_cap("Hinh_3.14_Admin_Analytics_Dashboard.png", "Hình 3.14: Giao diện Dashboard Thống kê và Phân tích lưu lượng bệnh viện")
    body("Hình 3.14 minh họa bảng điều khiển quản trị trung tâm dành cho ban giám đốc và quản trị viên bệnh viện. Màn hình trực quan hóa các chỉ số vận hành quan trọng như tổng số lượt tiếp đón trong ngày, thời gian chờ khám trung bình, doanh thu viện phí theo từng chuyên khoa và biểu đồ phân bổ lưu lượng bệnh nhân theo từng khung giờ thực tế. Qua đó giúp lãnh đạo bệnh viện nắm bắt tình hình và có phương án điều động nhân sự hợp lý trong các khung giờ cao điểm.")

    # 3.3.15
    h3("3.3.15. Chức năng Quản lý người dùng và Phân quyền truy cập RBAC")
    img_with_cap("Hinh_3.15_Admin_User_Management.png", "Hình 3.15: Giao diện Quản lý người dùng và Phân quyền truy cập RBAC")
    body("Hình 3.15 thể hiện giao diện quản lý danh sách tài khoản người dùng và phân quyền truy cập trong hệ thống. Quản trị viên có thể thêm mới nhân viên, cập nhật thông tin cá nhân, cấp phát hoặc thu hồi quyền hạn theo từng vai trò chuyên môn (Bác sĩ, Tiếp đón, Xét nghiệm, Dược, Thu ngân), đồng thời khóa tài khoản khi phát hiện dấu hiệu vi phạm bảo mật.")

    # 3.3.16
    h3("3.3.16. Chức năng Đăng nhập")
    img_with_cap("Hinh_3.16_Mobile_Login.png", "Hình 3.16: Giao diện Đăng nhập ứng dụng di động người bệnh", is_mobile=True)
    body("Hình 3.16 minh họa màn hình đăng nhập sạch sẽ, chuyên nghiệp trên ứng dụng di động MediCare Patient dành cho người bệnh. Màn hình bao gồm hai trường nhập tên đăng nhập và mật khẩu, liên kết chuyển đổi hiển thị mật khẩu và nút Đăng ký tài khoản mới bên dưới. Giao diện tuyệt đối không lưu sẵn thông tin tài khoản mặc định, bảo đảm an toàn bảo mật thông tin sức khỏe cho người bệnh.")

    # 3.3.17
    h3("3.3.17. Giao diện Trang chủ với Thẻ y tế số và Điều phối khám thông minh")
    img_with_cap("Hinh_3.17_Mobile_Home.png", "Hình 3.17: Giao diện Trang chủ với Thẻ y tế số và Điều phối khám thông minh", is_mobile=True)
    body("Hình 3.17 thể hiện màn hình trang chủ ứng dụng di động sau khi người bệnh đăng nhập thành công. Giao diện hiển thị lời chào cá nhân hóa, thanh trạng thái y tế và thẻ bảo hiểm điện tử trực quan. Đặc biệt, khung điều phối khám thông minh sẽ hiển thị thẻ trạng thái lượt khám hiện tại, buồng khám cần đến và số lượt đang chờ phía trước, giúp người bệnh theo dõi quy trình khám bệnh mọi lúc mọi nơi ngay trên điện thoại cá nhân.")

    # 3.3.18
    h3("3.3.18. Chức năng Đặt lịch khám chuyên khoa trên ứng dụng di động")
    img_with_cap("Hinh_3.18_Mobile_Booking.png", "Hình 3.18: Giao diện Đặt lịch khám chuyên khoa trên ứng dụng di động", is_mobile=True)
    body("Hình 3.18 minh họa chức năng đặt lịch khám bệnh trực tuyến ngay trên điện thoại di động. Người bệnh có thể duyệt qua danh sách các chuyên khoa, xem thông tin chi tiết của từng bác sĩ, chọn ngày khám và khung giờ còn trống phù hợp với thời gian cá nhân của mình chỉ với vài thao tác chạm lướt nhẹ nhàng.")

    # 3.3.19
    h3("3.3.19. Chức năng Vé khám điện tử QR Code và Theo dõi lượt khám")
    img_with_cap("Hinh_3.19_Mobile_Ticket.png", "Hình 3.19: Giao diện Vé khám điện tử QR Code và Theo dõi lượt khám", is_mobile=True)
    body("Hình 3.19 thể hiện vé khám bệnh điện tử chứa mã QR Code duy nhất của người bệnh. Khi đến cơ sở y tế, người bệnh chỉ cần xuất trình mã QR này tại quầy tiếp đón hoặc tại máy quét kiosk tự động để hoàn tất thủ tục check-in mà không cần xếp hàng lấy số giấy truyền thống.")

    # 3.3.20
    h3("3.3.20. Chức năng Tra cứu đơn thuốc điện tử và Hướng dẫn dùng thuốc")
    img_with_cap("Hinh_3.20_Mobile_Prescription.png", "Hình 3.20: Giao diện Tra cứu đơn thuốc điện tử và Hướng dẫn dùng thuốc", is_mobile=True)
    body("Hình 3.20 minh họa giao diện tra cứu đơn thuốc điện tử trên ứng dụng di động. Sau khi buổi khám kết thúc và bác sĩ xác nhận ký số đơn thuốc, người bệnh có thể mở ứng dụng để xem chi tiết từng loại thuốc, liều lượng, cách uống, thời điểm uống thuốc (trước hay sau bữa ăn) và lời dặn dò của bác sĩ điều trị.")

    # 3.3.21
    h3("3.3.21. Chức năng Tra cứu hóa đơn viện phí và Thanh toán trực tuyến")
    img_with_cap("Hinh_3.21_Mobile_Invoice.png", "Hình 3.21: Giao diện Tra cứu hóa đơn viện phí và Thanh toán trực tuyến", is_mobile=True)
    body("Hình 3.21 thể hiện màn hình tra cứu hóa đơn viện phí của người bệnh. Ứng dụng liệt kê rõ ràng các khoản chi phí phát sinh, trạng thái thanh toán và tích hợp sẵn nút thanh toán chuyển khoản qua ngân hàng, giúp người bệnh thanh toán viện phí từ xa mà không cần mất thời gian đứng chờ tại quầy thu ngân.")

    # 3.3.22
    h3("3.3.22. Chức năng Hồ sơ sức khỏe cá nhân và Cài đặt tài khoản")
    img_with_cap("Hinh_3.22_Mobile_Profile.png", "Hình 3.22: Giao diện Hồ sơ sức khỏe cá nhân và Cài đặt tài khoản", is_mobile=True)
    body("Hình 3.22 minh họa giao diện quản lý hồ sơ sức khỏe cá nhân và các cài đặt của người bệnh. Người bệnh có thể cập nhật thông tin cá nhân, xem lại lịch sử các đợt khám bệnh trước đây, cấu hình máy chủ kết nối và thực hiện đăng xuất tài khoản một cách an toàn.")

    return elements

def main():
    print("Loading source document...")
    doc = docx.Document(SOURCE_DOC)
    
    # Find start of Chapter 3 and start of Conclusion
    idx_start = -1
    idx_end = -1
    for idx, p in enumerate(doc.paragraphs):
        if "CHƯƠNG 3:" in p.text.upper():
            idx_start = idx
            break

    for idx, p in enumerate(doc.paragraphs):
        if "KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN" in p.text.upper():
            idx_end = idx
            break

    print(f"Chapter 3 found from paragraph {idx_start} to {idx_end}")
    
    if idx_start == -1 or idx_end == -1:
        print("ERROR: Cannot find markers!")
        return

    # Delete paragraphs from idx_start to idx_end - 1
    # We do it by removing XML elements
    p_end_obj = doc.paragraphs[idx_end]
    p_end_xml = p_end_obj._p

    print("Removing old Chapter 3 paragraphs...")
    to_remove = [doc.paragraphs[i]._p for i in range(idx_start, idx_end)]
    for elem in to_remove:
        elem.getparent().remove(elem)

    print("Building new Chapter 3 elements...")
    # Use a dummy doc to generate paragraphs and get their XML elements
    dummy_doc = docx.Document()
    new_elements = build_chapter_3_elements(dummy_doc)

    print(f"Inserting {len(new_elements)} new elements before Conclusion...")
    for elem in new_elements:
        p_end_xml.addprevious(elem)

    print(f"Saving to {OUTPUT_DOC}...")
    doc.save(OUTPUT_DOC)
    print("Document saved successfully!")

    # Also try copying to FINAL_DOC
    try:
        shutil.copyfile(OUTPUT_DOC, FINAL_DOC)
        print(f"Also copied to {FINAL_DOC}")
    except Exception as e:
        print(f"Note: Could not overwrite {FINAL_DOC} directly (file may be open): {e}")

if __name__ == "__main__":
    main()
