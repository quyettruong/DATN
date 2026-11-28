"""Bilingual Vietnamese-to-Kaggle clinical symptom mapper and specialty router."""

# Maps Vietnamese clinical phrases to Kaggle symptom tokens in Dataset
VI_TO_KAGGLE_SYMPTOMS = {
    "đau đầu": ["headache"],
    "nhức đầu": ["headache"],
    "đau nửa đầu": ["headache", "visual_disturbances", "nausea"],
    "chóng mặt": ["dizziness", "loss_of_balance", "spinning_movements"],
    "hoa mắt": ["dizziness", "blurred_and_distorted_vision"],
    "tiền đình": ["spinning_movements", "loss_of_balance", "unsteadiness", "nausea"],
    "mất thăng bằng": ["loss_of_balance", "unsteadiness"],
    "buồn nôn": ["nausea"],
    "nôn": ["vomiting", "nausea"],
    "ói": ["vomiting"],
    "sốt cao": ["high_fever", "chills"],
    "sốt nhẹ": ["mild_fever"],
    "sốt": ["high_fever"],
    "ớn lạnh": ["chills", "shivering"],
    "rét run": ["shivering", "chills"],
    "ho": ["cough"],
    "đờm": ["phlegm", "mucoid_sputum"],
    "ho ra máu": ["blood_in_sputum", "cough"],
    "đau họng": ["throat_irritation", "patches_in_throat"],
    "rát họng": ["throat_irritation"],
    "sổ mũi": ["runny_nose", "continuous_sneezing"],
    "nghẹt mũi": ["congestion", "sinus_pressure"],
    "hắt hơi": ["continuous_sneezing"],
    "khó thở": ["breathlessness"],
    "thở gấp": ["breathlessness", "fast_heart_rate"],
    "tức ngực": ["chest_pain", "breathlessness"],
    "đau ngực": ["chest_pain", "sweating"],
    "hồi hộp": ["palpitations", "fast_heart_rate"],
    "tim đập nhanh": ["fast_heart_rate", "palpitations"],
    "huyết áp": ["headache", "chest_pain", "dizziness"],
    "đau bụng": ["abdominal_pain", "stomach_pain"],
    "đau dạ dày": ["stomach_pain", "acidity", "indigestion"],
    "đau thượng vị": ["stomach_pain", "acidity", "vomiting"],
    "ợ chua": ["acidity", "indigestion"],
    "trào ngược": ["acidity", "chest_pain", "cough"],
    "tiêu chảy": ["diarrhoea", "dehydration"],
    "táo bón": ["constipation"],
    "khó tiêu": ["indigestion", "loss_of_appetite"],
    "chán ăn": ["loss_of_appetite"],
    "vàng da": ["yellowish_skin", "yellowing_of_eyes", "dark_urine"],
    "vàng mắt": ["yellowing_of_eyes", "yellowish_skin"],
    "ngứa": ["itching", "skin_rash"],
    "nổi mẩn": ["skin_rash", "itching"],
    "mẩn đỏ": ["skin_rash", "red_spots_over_body"],
    "nổi mề đay": ["skin_rash", "itching", "nodal_skin_eruptions"],
    "dị ứng": ["itching", "skin_rash", "continuous_sneezing"],
    "mụn": ["pus_filled_pimples", "blackheads", "scurring"],
    "vảy nến": ["skin_peeling", "silver_like_dusting", "skin_rash"],
    "nấm": ["itching", "skin_rash", "dischromic_patches"],
    "phồng rộp": ["blister", "skin_rash"],
    "đau khớp": ["joint_pain", "swelling_joints"],
    "sưng khớp": ["swelling_joints", "joint_pain", "movement_stiffness"],
    "khớp gối": ["knee_pain", "joint_pain", "painful_walking"],
    "đau lưng": ["back_pain", "neck_pain"],
    "đau cổ": ["neck_pain", "stiff_neck", "dizziness"],
    "cứng cổ": ["stiff_neck", "neck_pain"],
    "yếu chi": ["weakness_in_limbs", "muscle_weakness"],
    "đau cơ": ["muscle_pain", "fatigue"],
    "giãn tĩnh mạch": ["swollen_blood_vessels", "prominent_veins_on_calf", "swollen_legs"],
    "trĩ": ["pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool"],
    "đi ngoài ra máu": ["bloody_stool", "pain_during_bowel_movements"],
    "tiểu buốt": ["burning_micturition", "bladder_discomfort"],
    "tiểu rắt": ["continuous_feel_of_urine", "burning_micturition"],
    "nước tiểu đục": ["foul_smell_ofurine", "bladder_discomfort"],
    "mệt mỏi": ["fatigue", "lethargy", "malaise"],
    "sụt cân": ["weight_loss", "fatigue"],
    "tăng cân": ["weight_gain", "lethargy"],
    "tiểu đường": ["irregular_sugar_level", "polyuria", "excessive_hunger"],
    "khát nước": ["excessive_hunger", "polyuria", "dehydration"],
    "mờ mắt": ["blurred_and_distorted_vision", "visual_disturbances"],
    "đỏ mắt": ["redness_of_eyes", "watering_from_eyes"],
    "chảy nước mắt": ["watering_from_eyes", "redness_of_eyes"],
    "đổ mồ hôi": ["sweating"],
    "mất ngủ": ["restlessness", "anxiety"],
    "lo âu": ["anxiety", "irritability"],
}

EYE_HINTS = ["mắt", "mờ mắt", "đỏ mắt", "cộm mắt", "chảy nước mắt", "cận thị", "nhãn", "eye", "vision"]
DENTAL_HINTS = ["răng", "nướu", "lợi", "tủy", "nha khoa", "hàm mặt", "nhức răng", "sâu răng", "tooth", "gum"]

PRECAUTION_VI = {
    "consult nearest hospital": "Đến khám tại cơ sở y tế chuyên khoa gần nhất",
    "consult doctor": "Thăm khám trực tiếp với bác sĩ chuyên khoa",
    "stop irritation": "Ngừng tiếp xúc tác nhân gây kích ứng",
    "follow up": "Tái khám đúng hẹn để theo dõi tiến triển",
    "medication": "Dùng thuốc đúng theo đơn chỉ định của bác sĩ",
    "rest": "Nghỉ ngơi đầy đủ và tránh gắng sức",
    "drink plenty of water": "Uống nhiều nước ấm và bù điện giải",
    "avoid fatty spicy food": "Kiêng đồ ăn nhiều dầu mỡ, cay nóng",
    "exercise": "Vận động nhẹ nhàng phù hợp thể trạng",
    "take vapor": "Xông hơi mũi họng bằng nước ấm",
    "avoid cold food": "Tránh đồ ăn uống quá lạnh",
    "keep hydrated": "Bổ sung đủ nước mỗi ngày",
    "bath twice": "Giữ vệ sinh cơ thể sạch sẽ hàng ngày",
    "use detol or neem in bathing water": "Vệ sinh vùng da tổn thương bằng dung dịch sát khuẩn dịu nhẹ",
    "eat healthy": "Duy trì chế độ dinh dưỡng cân bằng",
    "lie down flat and raise the leg high": "Nằm nghỉ và kê cao chân giúp tuần hoàn máu tốt hơn",
    "drink vitamin c rich drinks": "Bổ sung thức uống giàu Vitamin C tăng sức đề kháng",
    "take vapour": "Xông hơi mũi họng bằng nước ấm",
    "keep fever in check": "Theo dõi thân nhiệt định kỳ và hạ sốt kịp thời",
    "call ambulance": "Gọi cấp cứu y tế ngay lập tức",
    "check in pulse": "Theo dõi mạch đập và huyết áp liên tục",
    "avoid lying down after eating": "Tránh nằm ngay trong vòng 30 phút sau khi ăn",
    "use antibiotics": "Điều trị kháng sinh theo đúng phác đồ bác sĩ kê",
    "avoid public places": "Hạn chế đến nơi đông người để tránh lây nhiễm",
    "apply calamine": "Thoa kem làm dịu da theo hướng dẫn bác sĩ",
    "use oinments": "Bôi thuốc mỡ ngoài da đúng liều lượng",
    "avoid abrupt head movment": "Tránh xoay đầu hoặc đổi tư thế đột ngột",
    "get proper sleep": "Ngủ đủ giấc và tránh căng thẳng kéo dài",
    "stop alcohol consumption": "Ngừng hoàn toàn rượu bia và đồ uống có cồn",
}


def extract_symptom_tokens(text: str, explicit_symptoms: list[str] | None = None) -> tuple[list[str], str | None]:
    """Return (kaggle_tokens, specialty_override_code) extracted from free text and symptom list."""
    tokens = []
    if explicit_symptoms:
        for s in explicit_symptoms:
            clean = s.strip().lower().replace(" ", "_")
            if clean and clean not in tokens:
                tokens.append(clean)

    raw_lower = (text or "").strip().lower()
    # Sort longer phrases first so "đau nửa đầu" matches before "đau đầu"
    for phrase in sorted(VI_TO_KAGGLE_SYMPTOMS.keys(), key=len, reverse=True):
        if phrase in raw_lower:
            for tok in VI_TO_KAGGLE_SYMPTOMS[phrase]:
                if tok not in tokens:
                    tokens.append(tok)

    # Also allow direct English tokens if typed
    for word in raw_lower.replace(",", " ").split():
        w = word.strip().replace("-", "_")
        if "_" in w and w not in tokens:
            tokens.append(w)

    override_dept = None
    if any(k in raw_lower for k in DENTAL_HINTS):
        override_dept = "RHM"
    elif any(k in raw_lower for k in EYE_HINTS) and "vàng mắt" not in raw_lower:
        override_dept = "MAT"

    return tokens, override_dept


def translate_precaution(text: str) -> str:
    key = (text or "").strip().lower()
    return PRECAUTION_VI.get(key, f"Khuyến nghị y khoa: {text}")
