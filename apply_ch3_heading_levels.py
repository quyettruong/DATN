# -*- coding: utf-8 -*-
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import shutil

SOURCE_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuong_3_Chuan_Nhat.docx"
OUT_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuong_3_Co_Cap_Heading.docx"
TARGET_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuan_Hoa_Moi_Nhat.docx"

def set_outline_level(p, level):
    pPr = p._p.get_or_add_pPr()
    outlineLvl = pPr.find(qn('w:outlineLvl'))
    if outlineLvl is None:
        outlineLvl = OxmlElement('w:outlineLvl')
        pPr.append(outlineLvl)
    outlineLvl.set(qn('w:val'), str(level))

def format_heading(p, style_name, outline_lvl, size_pt, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=12, space_after=6):
    try:
        p.style = p.part.document.styles[style_name]
    except Exception as e:
        print(f"Warning setting style {style_name}: {e}")
    
    p.alignment = align
    p.paragraph_format.first_line_indent = Inches(0)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    set_outline_level(p, outline_lvl)
    
    for r in p.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(size_pt)
        r.bold = True
        r.italic = False
        r.font.color.rgb = RGBColor(0, 0, 0)
        rPr = r._r.get_or_add_rPr()
        rFonts = rPr.find(qn('w:rFonts'))
        if rFonts is not None:
            rFonts.set(qn('w:ascii'), "Times New Roman")
            rFonts.set(qn('w:hAnsi'), "Times New Roman")
            rFonts.set(qn('w:cs'), "Times New Roman")
            rFonts.set(qn('w:eastAsia'), "Times New Roman")

def apply_chapter_3_heading_levels():
    print(f"Loading {SOURCE_DOC}...")
    doc = docx.Document(SOURCE_DOC)
    
    start_idx = -1
    end_idx = -1
    for i, p in enumerate(doc.paragraphs):
        t = p.text.strip().upper()
        if "CHƯƠNG 3:" in t and start_idx == -1:
            start_idx = i
        if "KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN" in t and end_idx == -1:
            end_idx = i
            
    print(f"Chapter 3 range: {start_idx} to {end_idx}")
    
    h1_count = 0
    h2_count = 0
    h3_count = 0
    
    for i in range(start_idx, end_idx):
        p = doc.paragraphs[i]
        t = p.text.strip()
        
        # Heading 1 (Mức 1): CHƯƠNG 3: ...
        if t.startswith("CHƯƠNG 3:"):
            format_heading(p, "Heading 1", outline_lvl=0, size_pt=14, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=18, space_after=12)
            print(f"P{i} [Mức 1 - Heading 1]: {t}")
            h1_count += 1
            
        # Heading 2 (Mức 2): 3.1., 3.2., 3.3., 3.4.
        elif any(t.startswith(f"3.{k}.") for k in range(1, 10)) and not any(t.startswith(f"3.{k}.{j}.") for k in range(1, 10) for j in range(1, 20)):
            format_heading(p, "Heading 2", outline_lvl=1, size_pt=13, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=14, space_after=6)
            print(f"P{i} [Mức 2 - Heading 2]: {t}")
            h2_count += 1
            
        # Heading 3 (Mức 3): 3.1.1., 3.2.1., 3.3.1., 3.4.1., etc.
        elif any(t.startswith(f"3.{k}.{j}.") for k in range(1, 10) for j in range(1, 20)):
            format_heading(p, "Heading 3", outline_lvl=2, size_pt=13, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=10, space_after=4)
            print(f"P{i} [Mức 3 - Heading 3]: {t}")
            h3_count += 1

    print(f"Applied: {h1_count} Heading 1, {h2_count} Heading 2, {h3_count} Heading 3.")
    
    print(f"Saving to {OUT_DOC}...")
    doc.save(OUT_DOC)
    print("Saved OUT_DOC successfully!")

    # Try copying to TARGET_DOC if not locked
    try:
        shutil.copyfile(OUT_DOC, TARGET_DOC)
        print(f"Also copied to {TARGET_DOC}!")
    except Exception as e:
        print(f"Note: {TARGET_DOC} currently locked in Word. User can close Word and copy or open {OUT_DOC} directly.")

if __name__ == "__main__":
    apply_chapter_3_heading_levels()
