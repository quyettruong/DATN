"""Train and evaluate Symptom-to-Disease & Department Classifier on Kaggle dataset."""

import json
import os
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

from ml_utils import stratified_split_indices, multiclass_metrics

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SYMPTOM_DIR = os.path.join(BASE_DIR, "data", "symptoms")
MODEL_DIR = os.path.join(BASE_DIR, "models")
CHART_DIR = os.path.join(BASE_DIR, "charts")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(CHART_DIR, exist_ok=True)

DISEASE_METADATA = {
    "(vertigo) Paroymsal  Positional Vertigo": ("Rối loạn tiền đình tư thế kịch phát", "TMH", "Tai Mũi Họng"),
    "AIDS": ("Suy giảm miễn dịch mắc phải", "NOI", "Nội tổng quát"),
    "Acne": ("Mụn trứng cá viêm da", "DA", "Da liễu"),
    "Alcoholic hepatitis": ("Viêm gan do rượu", "NOI", "Nội tổng quát"),
    "Allergy": ("Dị ứng / Viêm mũi dị ứng", "TMH", "Tai Mũi Họng"),
    "Arthritis": ("Viêm khớp", "NGOAI", "Ngoại tổng quát"),
    "Bronchial Asthma": ("Hen phế quản", "NOI", "Nội tổng quát"),
    "Cervical spondylosis": ("Thoái hóa đốt sống cổ", "NGOAI", "Ngoại tổng quát"),
    "Chicken pox": ("Thủy đậu", "DA", "Da liễu"),
    "Chronic cholestasis": ("Ứ mật mạn tính", "NOI", "Nội tổng quát"),
    "Common Cold": ("Cảm cúm / Viêm đường hô hấp trên", "TMH", "Tai Mũi Họng"),
    "Dengue": ("Sốt xuất huyết Dengue", "NOI", "Nội tổng quát"),
    "Diabetes ": ("Đái tháo đường", "NOI", "Nội tổng quát"),
    "Dimorphic hemmorhoids(piles)": ("Bệnh trĩ nội ngoại", "NGOAI", "Ngoại tổng quát"),
    "Drug Reaction": ("Phản ứng dị ứng thuốc", "DA", "Da liễu"),
    "Fungal infection": ("Nhiễm nấm da", "DA", "Da liễu"),
    "GERD": ("Trào ngược dạ dày thực quản", "NOI", "Nội tổng quát"),
    "Gastroenteritis": ("Viêm dạ dày ruột cấp", "NOI", "Nội tổng quát"),
    "Heart attack": ("Nhồi máu cơ tim / Đau thắt ngực cấp", "NOI", "Nội tổng quát"),
    "Hepatitis B": ("Viêm gan siêu vi B", "NOI", "Nội tổng quát"),
    "Hepatitis C": ("Viêm gan siêu vi C", "NOI", "Nội tổng quát"),
    "Hepatitis D": ("Viêm gan siêu vi D", "NOI", "Nội tổng quát"),
    "Hepatitis E": ("Viêm gan siêu vi E", "NOI", "Nội tổng quát"),
    "Hypertension ": ("Tăng huyết áp", "NOI", "Nội tổng quát"),
    "Hyperthyroidism": ("Cường giáp", "NOI", "Nội tổng quát"),
    "Hypoglycemia": ("Hạ đường huyết", "NOI", "Nội tổng quát"),
    "Hypothyroidism": ("Suy giáp", "NOI", "Nội tổng quát"),
    "Impetigo": ("Chốc lở nhiễm trùng da", "DA", "Da liễu"),
    "Jaundice": ("Vàng da bệnh lý gan mật", "NOI", "Nội tổng quát"),
    "Malaria": ("Sốt rét", "NOI", "Nội tổng quát"),
    "Migraine": ("Đau nửa đầu Migraine", "NOI", "Nội tổng quát"),
    "Osteoarthristis": ("Thoái hóa khớp", "NGOAI", "Ngoại tổng quát"),
    "Paralysis (brain hemorrhage)": ("Liệt nửa người / Xuất huyết não", "NOI", "Nội tổng quát"),
    "Peptic ulcer diseae": ("Viêm loét dạ dày tá tràng", "NOI", "Nội tổng quát"),
    "Pneumonia": ("Viêm phổi", "NOI", "Nội tổng quát"),
    "Psoriasis": ("Vảy nến", "DA", "Da liễu"),
    "Tuberculosis": ("Lao phổi", "NOI", "Nội tổng quát"),
    "Typhoid": ("Sốt thương hàn", "NOI", "Nội tổng quát"),
    "Urinary tract infection": ("Nhiễm trùng đường tiết niệu", "NGOAI", "Ngoại tổng quát"),
    "Varicose veins": ("Suy giãn tĩnh mạch chi dưới", "NGOAI", "Ngoại tổng quát"),
    "hepatitis A": ("Viêm gan siêu vi A", "NOI", "Nội tổng quát"),
}


def build_symptom_text(row: pd.Series, symptom_cols: list[str]) -> str:
    tokens = []
    for col in symptom_cols:
        val = row[col]
        if pd.notna(val):
            clean = str(val).strip().lower().replace(" ", "_")
            if clean:
                tokens.append(clean)
    return " ".join(tokens)


def main() -> None:
    dataset_path = os.path.join(SYMPTOM_DIR, "dataset.csv")
    severity_path = os.path.join(SYMPTOM_DIR, "Symptom-severity.csv")
    desc_path = os.path.join(SYMPTOM_DIR, "symptom_Description.csv")
    prec_path = os.path.join(SYMPTOM_DIR, "symptom_precaution.csv")

    df = pd.read_csv(dataset_path)
    symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]
    df["symptom_text"] = df.apply(lambda r: build_symptom_text(r, symptom_cols), axis=1)
    df["disease_clean"] = df["Disease"].astype(str)

    print(f"Loaded Kaggle symptom dataset: {df.shape}, unique diseases: {df['disease_clean'].nunique()}")

    texts = df["symptom_text"].to_numpy()
    labels = df["disease_clean"].to_numpy()

    tr_idx, te_idx = stratified_split_indices(labels, test_size=0.2, seed=42)
    X_train_txt, X_test_txt = texts[tr_idx], texts[te_idx]
    y_train, y_test = labels[tr_idx], labels[te_idx]

    vectorizer = CountVectorizer(token_pattern=r"[^\s]+")
    X_train = vectorizer.fit_transform(X_train_txt)
    X_test = vectorizer.transform(X_test_txt)

    models = {
        "MultinomialNB": MultinomialNB(),
        "DecisionTree": DecisionTreeClassifier(random_state=42),
        "RandomForest": RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1),
    }

    results = []
    trained = {}
    for name, clf in models.items():
        print(f"Training {name} ...")
        clf.fit(X_train, y_train)
        preds = clf.predict(X_test)
        m = multiclass_metrics(y_test, preds)
        m["name"] = name
        results.append(m)
        trained[name] = clf
        print(f"  -> Accuracy={m['accuracy']:.4f}, Macro-F1={m['macro_f1']:.4f}")

    sev_df = pd.read_csv(severity_path)
    severity_map = {
        str(r["Symptom"]).strip().lower().replace(" ", "_"): int(r["weight"])
        for _, r in sev_df.iterrows()
    }

    desc_df = pd.read_csv(desc_path)
    desc_map = {str(r["Disease"]).strip(): str(r["Description"]).strip() for _, r in desc_df.iterrows()}

    prec_df = pd.read_csv(prec_path)
    prec_map = {}
    for _, r in prec_df.iterrows():
        dis = str(r["Disease"]).strip()
        precs = [str(r[c]).strip() for c in ["Precaution_1", "Precaution_2", "Precaution_3", "Precaution_4"] if pd.notna(r[c])]
        prec_map[dis] = precs

    best_res = max(results, key=lambda r: (r["accuracy"], r["macro_f1"]))
    best_name = best_res["name"]
    best_clf = trained[best_name]

    bundle = {
        "vectorizer": vectorizer,
        "model": best_clf,
        "model_name": best_name,
        "dataset": "itachi9604/disease-symptom-description-dataset",
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train_txt)),
        "test_samples": int(len(X_test_txt)),
        "unique_diseases": int(df["disease_clean"].nunique()),
        "severity_weights": severity_map,
        "descriptions": desc_map,
        "precautions": prec_map,
        "disease_metadata": DISEASE_METADATA,
        "metrics": best_res,
    }
    model_path = os.path.join(MODEL_DIR, "symptom_model.joblib")
    joblib.dump(bundle, model_path)
    print(f"Saved symptom classifier to {model_path}")

    metrics_out = {
        "dataset": "itachi9604/disease-symptom-description-dataset",
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train_txt)),
        "test_samples": int(len(X_test_txt)),
        "unique_diseases": int(df["disease_clean"].nunique()),
        "unique_symptoms": len(severity_map),
        "best_model": best_name,
        "comparison": results,
    }
    with open(os.path.join(MODEL_DIR, "symptom_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics_out, f, indent=2, ensure_ascii=False)

    fig, axes = plt.subplots(1, 2, figsize=(13, 5), dpi=200)
    names = [r["name"] for r in results]
    accs = [r["accuracy"] * 100 for r in results]
    axes[0].bar(names, accs, color=["#0ea5e9", "#2563eb", "#0d9488"])
    axes[0].set_ylim(0, 112)
    axes[0].set_title("Do chinh xac mo hinh phan loai trieu chung (%)", fontsize=11, fontweight="bold")
    axes[0].set_ylabel("Accuracy (%)")
    for idx, val in enumerate(accs):
        axes[0].text(idx, val + 1.5, f"{val:.2f}%", ha="center", fontweight="bold")
    axes[0].grid(axis="y", alpha=0.3)

    dept_counts = {}
    for _, (_, dept_code, dept_name) in DISEASE_METADATA.items():
        dept_counts[dept_name] = dept_counts.get(dept_name, 0) + 1
    pd.Series(dept_counts).sort_values().plot(kind="barh", ax=axes[1], color="#6366f1")
    axes[1].set_title("Phan bo 41 nhom benh Kaggle theo Chuyen khoa", fontsize=11, fontweight="bold")
    axes[1].set_xlabel("So nhom benh")
    axes[1].grid(axis="x", alpha=0.3)

    plt.tight_layout()
    chart_path = os.path.join(CHART_DIR, "symptom_evaluation.png")
    plt.savefig(chart_path, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved symptom chart to {chart_path}")


if __name__ == "__main__":
    main()
