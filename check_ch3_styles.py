import docx

doc = docx.Document(r'C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuan_Hoa_Moi_Nhat.docx')

print('--- Check Heading Styles in Chapter 3 ---')
for i, p in enumerate(doc.paragraphs[604:715], start=604):
    t = p.text.strip()
    if t.startswith(('CHƯƠNG', '3.', '3.1', '3.2', '3.3', '3.4')):
        print(f'P{i}: style=\"{p.style.name}\" | text=\"{t}\"')
