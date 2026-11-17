import docx

doc = docx.Document(r'C:\Users\trinh\Downloads\doantotnghiep\Mấu đồ án-Trương Văn Quyết - Chuan_Hoa_Moi_Nhat.docx')

print('--- Check Heading Styles in Chapters 1 & 2 ---')
count = 0
for i, p in enumerate(doc.paragraphs[:604]):
    t = p.text.strip()
    if any(t.startswith(prefix) for prefix in ['CHƯƠNG', '1.', '2.', '1.1', '2.1', '2.2', '2.3', '2.3.1', '2.3.3.1']):
        print(f'P{i}: style=\"{p.style.name}\" | text=\"{t}\"')
        count += 1
        if count >= 30:
            break
