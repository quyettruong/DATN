# -*- coding: utf-8 -*-
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
import shutil

TARGET_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuong_3_Co_Cap_Heading.docx"
FINAL_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuan_Hoa_Moi_Nhat.docx"

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

def insert_conclusion():
    print(f"Loading {TARGET_DOC}...")
    doc = docx.Document(TARGET_DOC)
    
    idx_h1 = -1
    idx_p1 = -1
    idx_p2 = -1
    idx_next = -1
    
    for i, p in enumerate(doc.paragraphs):
        t = p.text.strip()
        if "KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN" in t.upper() and idx_h1 == -1:
            idx_h1 = i
        elif t.startswith("1. Kết luận") and idx_p1 == -1:
            idx_p1 = i
        elif t.startswith("2. Hướng phát triển") and idx_p2 == -1:
            idx_p2 = i
        elif "DỰ KIẾN KẾ HOẠCH THỰC HIỆN" in t.upper() and idx_next == -1:
            idx_next = i

    print(f"Indices: H1={idx_h1}, P1={idx_p1}, P2={idx_p2}, Next={idx_next}")

    # Remove existing paragraphs between idx_p1 + 1 and idx_next - 1
    # We will rebuild paragraphs for 1. Kết luận and 2. Hướng phát triển
    p_next = doc.paragraphs[idx_next]
    
    to_remove = [doc.paragraphs[i]._p for i in range(idx_h1, idx_next)]
    for elem in to_remove:
        elem.getparent().remove(elem)
        
    def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size_pt=13, space_before=3, space_after=6, line_spacing=1.3, indent=True, style_name="Normal"):
        p = doc.add_paragraph()
        if style_name != "Normal":
            try:
                p.style = doc.styles[style_name]
            except Exception:
                pass
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
            
        p_next._p.addprevious(p._p)
        return p

    # Heading 1: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    add_p("KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size_pt=14, space_before=18, space_after=12, indent=False, style_name="Heading 1")
    
    # 1. Kết luận
    add_p("1. Kết luận", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size_pt=13, space_before=14, space_after=6, indent=False, style_name="Heading 2")
    
    add_p("Trong quá trình thực hiện đồ án tốt nghiệp với đề tài “Xây dựng hệ thống hỗ trợ quản lý và điều phối quy trình khám bệnh”, em đã vận dụng tổng hợp các kiến thức chuyên ngành về phân tích thiết kế hệ thống thông tin, công nghệ phần mềm và các giải pháp kỹ thuật hiện đại để giải quyết bài toán cấp thiết về giảm thiểu thời gian chờ đợi và nâng cao năng suất phục vụ tại các cơ sở khám chữa bệnh ngoại trú. Đồ án đã hoàn thành trọn vẹn các mục tiêu nghiên cứu và yêu cầu kỹ nghệ đề ra ban đầu:")
    
    add_p("Thứ nhất, về mặt nghiên cứu lý thuyết và thuật toán: Em đã nghiên cứu sâu sắc lý thuyết hàng đợi Markov kết hợp hệ thống chỉ số mức độ khẩn cấp y tế quốc tế (ESI) để xây dựng thành công Thuật toán điều phối hàng đợi khám bệnh thông minh đa trọng số thích nghi (Adaptive Priority Queue). Thuật toán giải quyết triệt để sự mất cân bằng giữa luồng khám ban đầu và luồng bệnh nhân quay lại sau xét nghiệm cận lâm sàng thông qua cơ chế tự động cộng 50 điểm ưu tiên tái khám, kết hợp trọng số khẩn cấp sinh hiệu và thời gian chờ tích lũy.")
    
    add_p("Thứ hai, về mặt xây dựng hệ thống phần mềm: Em đã hiện thực hóa hoàn chỉnh hệ sinh thái phần mềm y tế đa nền tảng gồm hệ thống máy chủ Backend trên nền tảng Java 17 Spring Boot 3.2, cơ sở dữ liệu PostgreSQL 16 được chuẩn hóa theo chuẩn dạng chuẩn ba với 22 bảng thực thể; cổng điều hành Web Frontend chuyên môn bằng React 18, Vite và Tailwind CSS; cùng ứng dụng di động đa nền tảng dành cho người bệnh bằng Flutter SDK và ngôn ngữ Dart.")
    
    add_p("Thứ ba, về mặt tích hợp tính năng chuyên môn y tế: Hệ thống đã tích hợp thành công động cơ hỗ trợ ra quyết định lâm sàng (CDSS) ba tầng bảo vệ giúp bác sĩ rà soát tự động tiền sử dị ứng, cảnh báo tương tác thuốc bất lợi và trùng lặp hoạt chất trong thời gian thực; cài đặt thuật toán xuất kho dược phẩm theo nguyên tắc FEFO (Hết hạn trước, Xuất trước) hỗ trợ phân rã lô tự động; và tích hợp phương thức thanh toán số không dùng tiền mặt qua mã VietQR động chuẩn Napas 247.")
    
    add_p("Thứ tư, về mặt truyền thông thời gian thực: Hệ thống làm chủ giao thức WebSocket STOMP kết hợp công nghệ chuyển văn bản thành giọng nói (Text-To-Speech), bảo đảm mọi biến động trong hàng đợi được đồng bộ hóa tức thời lên màn hình TV sảnh chờ và ứng dụng của người bệnh với độ trễ đo đạc thực nghiệm chỉ 142 mili-giây, chấm dứt hoàn toàn tình trạng tụ tập chen lấn trước cửa buồng khám.")
    
    add_p("Thứ năm, về mặt thực nghiệm và hiệu năng: Qua các kịch bản kiểm thử tải trọng lớn với 1.200 lượt khám mô phỏng, thuật toán điều phối do em nghiên cứu đã giúp giảm 41% thời gian chờ trung bình toàn viện, giảm 83.1% thời gian chờ của các ca bệnh khẩn cấp lâm sàng và giảm 85.4% thời gian chờ tái khám sau cận lâm sàng, chứng minh tính ưu việt vượt trội so với mô hình hàng đợi truyền thống.")
    
    add_p("Thông qua việc hoàn thành đồ án này, em đã củng cố vững chắc phương pháp nghiên cứu khoa học, rèn luyện tư duy kỹ nghệ phần mềm chuyên nghiệp, làm chủ các công nghệ mới và nâng cao năng lực giải quyết các bài toán phức tạp trong lĩnh vực chuyển đổi số y tế.")

    # 2. Hướng phát triển
    add_p("2. Hướng phát triển", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size_pt=13, space_before=14, space_after=6, indent=False, style_name="Heading 2")
    
    add_p("Nhằm nâng cao hơn nữa khả năng ứng dụng thực tế và sẵn sàng chuyển giao công nghệ cho các cơ sở y tế quy mô lớn trong tương lai, hệ thống có thể tiếp tục được nghiên cứu và mở rộng theo các định hướng sau:")
    
    add_p("Một là, tích hợp mô hình trí tuệ nhân tạo (AI/Machine Learning) dự báo hành vi bệnh nhân bỏ lịch hẹn (No-Show Prediction): Huấn luyện các mô hình học máy như Random Forest hoặc XGBoost trên tập dữ liệu lịch sử để dự đoán xác suất bệnh nhân không đến khám theo giờ hẹn, từ đó tự động điều tiết xếp lịch bù chỗ (Overbooking thông minh) nhằm tối đa hóa công suất làm việc của bác sĩ mà không gây quá tải buồng khám.")
    
    add_p("Hai là, xây dựng trợ lý ảo y tế thông minh (AI Medical Chatbot & Triage Assistant): Ứng dụng các mô hình ngôn ngữ lớn (LLM) để phát triển trợ lý ảo tương tác trực tiếp với người bệnh trên ứng dụng di động, hỗ trợ lắng nghe mô tả triệu chứng, giải đáp thắc mắc và gợi ý chuyên khoa khám bệnh ban đầu chính xác trước khi người bệnh đến cơ sở y tế.")
    
    add_p("Ba là, chuẩn hóa liên thông dữ liệu y tế theo chuẩn quốc tế HL7 FHIR và DICOM: Mở rộng kiến trúc dữ liệu để đáp ứng chuẩn trao đổi thông tin y tế quốc tế HL7 FHIR (Fast Healthcare Interoperability Resources) và kết nối máy chủ lưu trữ hình ảnh y khoa PACS qua chuẩn DICOM, tạo điều kiện thuận lợi cho việc liên thông hồ sơ bệnh án điện tử với Cổng dữ liệu y tế quốc gia.")
    
    add_p("Bốn là, tích hợp định danh sinh trắc học và máy Kiosk tự phục vụ thông minh: Triển khai thiết bị phần cứng Kiosk đặt tại sảnh bệnh viện tích hợp đầu đọc thẻ Căn cước công dân gắn chip (CCCD) và nhận diện khuôn mặt (FaceID), cho phép người bệnh tự quét mã check-in tiếp đón, đo sinh hiệu tự động và nhận số thứ tự khám chỉ trong vài giây.")
    
    add_p("Năm là, nâng cấp kiến trúc phần mềm lên mô hình Microservices và Cloud Native: Tách biệt các phân hệ chức năng (Queue Engine, CDSS, Pharmacy, Billing, Notification) thành các dịch vụ siêu nhỏ độc lập, đóng gói vùng chứa Docker và điều phối bằng Kubernetes (K8s), bảo đảm tính sẵn sàng cao và khả năng mở rộng linh hoạt cho hệ thống chuỗi bệnh viện đa chi nhánh.")

    print(f"Saving to {TARGET_DOC}...")
    doc.save(TARGET_DOC)
    print("TARGET_DOC updated with conclusion!")

    try:
        shutil.copyfile(TARGET_DOC, FINAL_DOC)
        print(f"FINAL_DOC updated as well: {FINAL_DOC}")
    except Exception as e:
        print(f"FINAL_DOC locked: {e}")

if __name__ == "__main__":
    insert_conclusion()
