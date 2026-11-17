import docx

doc = docx.Document(r'C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuan_Hoa_Moi_Nhat.docx')

def inspect_p(p, label):
    print(f'=== {label} ===')
    print('style:', p.style.name)
    print('alignment:', p.alignment)
    print('space_before:', p.paragraph_format.space_before)
    print('space_after:', p.paragraph_format.space_after)
    print('first_line_indent:', p.paragraph_format.first_line_indent)
    for r in p.runs:
        print(f'  run: text=\"{r.text}\" font={r.font.name} size={r.font.size} bold={r.bold} italic={r.italic} color={r.font.color.rgb if r.font.color else None}')

inspect_p(doc.paragraphs[305], 'P305 (CHƯƠNG 1 - Heading 1)')
inspect_p(doc.paragraphs[306], 'P306 (1.1 - Heading 2)')
inspect_p(doc.paragraphs[342], 'P342 (2.2.1 - Heading 3)')
inspect_p(doc.paragraphs[379], 'P379 (2.3.3.1 - Heading 4)')
