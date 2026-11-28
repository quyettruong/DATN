"""FastAPI microservice serving MediCare Kaggle-trained ML models."""

import json
import os
from typing import List, Optional

import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from symptom_mapper import extract_symptom_tokens, translate_precaution

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

noshow_bundle = joblib.load(os.path.join(MODEL_DIR, "noshow_model.joblib"))
symptom_bundle = joblib.load(os.path.join(MODEL_DIR, "symptom_model.joblib"))

with open(os.path.join(MODEL_DIR, "noshow_metrics.json"), "r", encoding="utf-8") as f:
    noshow_metrics = json.load(f)
with open(os.path.join(MODEL_DIR, "symptom_metrics.json"), "r", encoding="utf-8") as f:
    symptom_metrics = json.load(f)

app = FastAPI(
    title="MediCare AI Service",
    description="Machine Learning API trained on Kaggle datasets for Outpatient No-Show Prediction & Clinical Symptom Triage",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEPT_INFO = {
    "NOI": ("Khoa Nội Tổng Quát", "R101 - R102"),
    "NGOAI": ("Khoa Ngoại Tổng Quát", "R201 - R202"),
    "TMH": ("Khoa Tai Mũi Họng", "R301 - R302"),
    "RHM": ("Khoa Răng Hàm Mặt", "R401 - R402"),
    "MAT": ("Khoa Mắt (Nhãn Khoa)", "R501 - R502"),
    "DA": ("Khoa Da Liễu", "R601 - R602"),
}


class NoShowRequest(BaseModel):
    gender: str = "F"
    age: int = 35
    lead_time_days: int = 1
    scheduled_hour: int = 9
    appt_dayofweek: int = 1
    scholarship: int = 0
    hypertension: int = 0
    diabetes: int = 0
    alcoholism: int = 0
    handicap: int = 0
    sms_received: int = 1


class SymptomRequest(BaseModel):
    symptom_text: str = ""
    symptoms: Optional[List[str]] = None


@app.get("/health")
def health():
    return {
        "status": "UP",
        "noshow_model": {
            "algorithm": noshow_bundle["model_name"],
            "dataset": noshow_bundle["dataset"],
            "samples": noshow_bundle["total_samples"],
            "metrics": noshow_bundle["metrics"],
        },
        "symptom_model": {
            "algorithm": symptom_bundle["model_name"],
            "dataset": symptom_bundle["dataset"],
            "samples": symptom_bundle["total_samples"],
            "unique_diseases": symptom_bundle["unique_diseases"],
            "metrics": symptom_bundle["metrics"],
        },
        "metrics_summary": {
            "noshow": noshow_metrics,
            "symptoms": symptom_metrics,
        },
    }


@app.post("/predict/no-show")
def predict_noshow(req: NoShowRequest):
    gender_num = 1 if (req.gender or "").strip().upper().startswith("M") else 0
    lead_days = max(0, int(req.lead_time_days))
    is_same_day = 1 if lead_days == 0 else 0

    row = np.array([[
        gender_num,
        max(0, min(110, int(req.age))),
        lead_days,
        max(0, min(23, int(req.scheduled_hour))),
        max(0, min(6, int(req.appt_dayofweek))),
        is_same_day,
        int(req.scholarship),
        int(req.hypertension),
        int(req.diabetes),
        int(req.alcoholism),
        int(req.handicap),
        int(req.sms_received),
    ]], dtype=np.float32)

    model = noshow_bundle["model"]
    prob = float(model.predict_proba(row)[0, 1])
    pct = round(prob * 100.0, 1)

    if prob >= 0.55:
        risk_level = "HIGH"
        risk_label = "Nguy cơ bỏ hẹn cao"
        advice = "Khuyến nghị gửi tin nhắn nhắc lịch trước 24h và gọi điện xác nhận giữ chỗ."
    elif prob >= 0.35:
        risk_level = "MEDIUM"
        risk_label = "Nguy cơ bỏ hẹn trung bình"
        advice = "Nên bật nhắc lịch tự động trên ứng dụng di động trước buổi khám."
    else:
        risk_level = "LOW"
        risk_label = "Tỷ lệ đến khám ổn định"
        advice = "Khả năng bệnh nhân đến đúng hẹn cao, không cần can thiệp đặc biệt."

    return {
        "no_show_probability": round(prob, 4),
        "probability_percent": pct,
        "will_no_show": prob >= float(noshow_bundle.get("optimal_threshold", 0.53)),
        "risk_level": risk_level,
        "risk_label_vi": risk_label,
        "recommended_action": advice,
        "model_name": noshow_bundle["model_name"],
        "roc_auc": noshow_bundle["metrics"]["roc_auc"],
        "dataset": noshow_bundle["dataset"],
    }


@app.post("/predict/symptom")
def predict_symptom(req: SymptomRequest):
    tokens, override_dept = extract_symptom_tokens(req.symptom_text, req.symptoms)

    # Calculate severity score from Kaggle Symptom-severity weights
    sev_weights = symptom_bundle["severity_weights"]
    sev_total = sum(sev_weights.get(tok, 3) for tok in tokens)

    if override_dept == "RHM":
        dept_name, room_hint = DEPT_INFO["RHM"]
        return {
            "matched_symptoms": tokens if tokens else ["dental_symptom"],
            "top_predictions": [
                {"disease_en": "Dental & Oral Pathology", "disease_vi": "Bệnh lý Răng Hàm Mặt", "probability": 0.92}
            ],
            "recommended_department_code": "RHM",
            "recommended_department_name": dept_name,
            "recommended_room_hint": room_hint,
            "severity_score": max(3, sev_total),
            "urgency_level": "LOW",
            "urgency_text": "Khám chuyên khoa Răng Hàm Mặt theo hẹn",
            "precautions": [
                "Tránh đồ ăn quá nóng, quá lạnh hoặc cứng",
                "Súc miệng nước muối sinh lý sau ăn",
                "Đặt lịch khám chuyên khoa Răng Hàm Mặt để bác sĩ kiểm tra trực tiếp",
            ],
            "model_name": f"{symptom_bundle['model_name']} + Clinical Routing",
            "dataset": symptom_bundle["dataset"],
        }

    if override_dept == "MAT":
        dept_name, room_hint = DEPT_INFO["MAT"]
        return {
            "matched_symptoms": tokens if tokens else ["ocular_symptom"],
            "top_predictions": [
                {"disease_en": "Ophthalmic Condition", "disease_vi": "Bệnh lý Nhãn khoa / Khúc xạ", "probability": 0.91}
            ],
            "recommended_department_code": "MAT",
            "recommended_department_name": dept_name,
            "recommended_room_hint": room_hint,
            "severity_score": max(3, sev_total),
            "urgency_level": "LOW",
            "urgency_text": "Khám chuyên khoa Mắt theo hẹn",
            "precautions": [
                "Không dụi tay trực tiếp lên mắt",
                "Có thể nhỏ nước muối sinh lý 0.9% làm dịu mắt",
                "Khám chuyên khoa Mắt nếu nhìn mờ hoặc đỏ mắt kéo dài",
            ],
            "model_name": f"{symptom_bundle['model_name']} + Clinical Routing",
            "dataset": symptom_bundle["dataset"],
        }

    if not tokens:
        dept_name, room_hint = DEPT_INFO["NOI"]
        return {
            "matched_symptoms": [],
            "top_predictions": [
                {"disease_en": "General Clinical Screening", "disease_vi": "Sàng lọc Nội khoa tổng quát", "probability": 0.70}
            ],
            "recommended_department_code": "NOI",
            "recommended_department_name": dept_name,
            "recommended_room_hint": room_hint,
            "severity_score": 2,
            "urgency_level": "LOW",
            "urgency_text": "Khám sàng lọc tổng quát",
            "precautions": [
                "Mô tả thêm triệu chứng cụ thể như sốt, ho, đau đầu hoặc đau bụng để AI dự đoán chính xác hơn",
                "Đến phòng Nội Tổng Quát để bác sĩ thăm khám ban đầu",
            ],
            "model_name": symptom_bundle["model_name"],
            "dataset": symptom_bundle["dataset"],
        }

    vec = symptom_bundle["vectorizer"]
    clf = symptom_bundle["model"]
    X_in = vec.transform([" ".join(tokens)])
    probs = clf.predict_proba(X_in)[0]
    classes = clf.classes_

    top_idx = np.argsort(probs)[::-1][:3]
    meta = symptom_bundle["disease_metadata"]
    prec_map = symptom_bundle["precautions"]

    top_preds = []
    for idx in top_idx:
        dis_en = str(classes[idx])
        vi_name, dept_code, dept_name = meta.get(dis_en, (dis_en, "NOI", "Nội tổng quát"))
        top_preds.append({
            "disease_en": dis_en.strip(),
            "disease_vi": vi_name,
            "department_code": dept_code,
            "department_name": dept_name,
            "probability": round(float(probs[idx]), 4),
        })

    best = top_preds[0]
    best_dept_code = best["department_code"]
    dept_name, room_hint = DEPT_INFO.get(best_dept_code, DEPT_INFO["NOI"])

    # Determine urgency from Kaggle severity weight sum and critical tokens
    high_risk_tokens = {"chest_pain", "breathlessness", "coma", "stomach_bleeding", "weakness_of_one_body_side", "altered_sensorium"}
    if any(t in high_risk_tokens for t in tokens) or sev_total >= 12 or best["disease_en"] in {"Heart attack", "Paralysis (brain hemorrhage)"}:
        urgency = "HIGH"
        urgency_text = "Cần khám sớm hoặc vào thẳng phân loại cấp cứu Triage"
    elif sev_total >= 6:
        urgency = "MEDIUM"
        urgency_text = "Nên đặt lịch khám sớm trong 24h - 48h"
    else:
        urgency = "LOW"
        urgency_text = "Khám chuyên khoa theo lịch hẹn thông thường"

    raw_precs = prec_map.get(best["disease_en"], [])
    precs_vi = [translate_precaution(p) for p in raw_precs]
    if not precs_vi:
        precs_vi = ["Nghỉ ngơi hợp lý và đặt lịch thăm khám trực tiếp với bác sĩ chuyên khoa"]

    return {
        "matched_symptoms": tokens,
        "top_predictions": top_preds,
        "recommended_department_code": best_dept_code,
        "recommended_department_name": dept_name,
        "recommended_room_hint": room_hint,
        "severity_score": int(sev_total),
        "urgency_level": urgency,
        "urgency_text": urgency_text,
        "precautions": precs_vi,
        "model_name": symptom_bundle["model_name"],
        "accuracy": symptom_bundle["metrics"]["accuracy"],
        "dataset": symptom_bundle["dataset"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
