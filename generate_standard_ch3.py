# -*- coding: utf-8 -*-
import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

SOURCE_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Ban_Chinh_Thuc_Chuong_3.docx"
DEST_DOC = r"C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Ban_Chuan_Chuong_3.docx"
IMG_DIR = r"C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images"

def format_run(run, font_name="Times New Roman", size_pt=13, bold=False, italic=False, color=RGBColor(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color
    # Ensure EastAsian font is also Times New Roman
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is not None:
        rFonts.set(qn('w:ascii'), font_name)
        rFonts.set(qn('w:hAnsi'), font_name)
        rFonts.set(qn('w:cs'), font_name)
        rFonts.set(qn('w:eastAsia'), font_name)

def add_para(doc, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size_pt=13, space_before=3, space_after=6, line_spacing=1.3, indent=True):
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

def add_heading_h1(doc, text):
    return add_para(doc, text, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, italic=False, size_pt=14, space_before=18, space_after=12, indent=False)

def add_heading_h2(doc, text):
    return add_para(doc, text, align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, italic=False, size_pt=13, space_before=14, space_after=6, indent=False)

def add_heading_h3(doc, text):
    return add_para(doc, text, align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, italic=False, size_pt=13, space_before=10, space_after=4, indent=False)

def add_image_with_caption(doc, img_name, caption_text, is_mobile=False):
    img_path = os.path.join(IMG_DIR, img_name)
    if not os.path.exists(img_path):
        print(f"WARNING: Image not found {img_path}")
        return
    
    # Image paragraph (Centered, no indent)
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(4)
    p_img.paragraph_format.first_line_indent = Inches(0)
    
    width = Inches(2.9) if is_mobile else Inches(6.0)
    p_img.add_run().add_picture(img_path, width=width)
    
    # Caption paragraph (Centered, bold, NOT italic, 13pt)
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(4)
    p_cap.paragraph_format.space_after = Pt(10)
    p_cap.paragraph_format.first_line_indent = Inches(0)
    
    run_cap = p_cap.add_run(caption_text)
    format_run(run_cap, bold=True, italic=False, size_pt=13)

print("Helper script ready.")
