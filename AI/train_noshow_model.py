"""Train and evaluate Medical Appointment No-Show Prediction models on Kaggle dataset."""

import json
import os
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier

from ml_utils import (
    stratified_split_indices,
    binary_classification_metrics,
    compute_roc_curve,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "noshow", "KaggleV2-May-2016.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
CHART_DIR = os.path.join(BASE_DIR, "charts")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(CHART_DIR, exist_ok=True)

FEATURE_COLS = [
    "gender_num",
    "age",
    "lead_time_days",
    "scheduled_hour",
    "appt_dayofweek",
    "is_same_day",
    "scholarship",
    "hypertension",
    "diabetes",
    "alcoholism",
    "handicap",
    "sms_received",
]


def load_and_preprocess(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df = df[(df["Age"] >= 0) & (df["Age"] <= 110)].copy()

    sched = pd.to_datetime(df["ScheduledDay"], utc=True)
    appt = pd.to_datetime(df["AppointmentDay"], utc=True)
    lead_days = (appt.dt.normalize() - sched.dt.normalize()).dt.days.clip(lower=0)

    return pd.DataFrame({
        "gender_num": (df["Gender"].str.upper() == "M").astype(int),
        "age": df["Age"].astype(int),
        "lead_time_days": lead_days.astype(int),
        "scheduled_hour": sched.dt.hour.astype(int),
        "appt_dayofweek": appt.dt.dayofweek.astype(int),
        "is_same_day": (lead_days == 0).astype(int),
        "scholarship": df["Scholarship"].astype(int),
        "hypertension": df["Hipertension"].astype(int),
        "diabetes": df["Diabetes"].astype(int),
        "alcoholism": df["Alcoholism"].astype(int),
        "handicap": (df["Handcap"] > 0).astype(int),
        "sms_received": df["SMS_received"].astype(int),
        "target": (df["No-show"].str.strip().str.lower() == "yes").astype(int),
    })


def find_optimal_threshold(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    best_th = 0.5
    best_f1 = -1.0
    for th in np.linspace(0.15, 0.70, 56):
        m = binary_classification_metrics(y_true, y_prob, threshold=float(th))
        if m["f1"] > best_f1:
            best_f1 = m["f1"]
            best_th = float(th)
    return round(best_th, 3)


def main() -> None:
    print(f"Loading Kaggle No-Show dataset from {DATA_PATH} ...")
    df = load_and_preprocess(DATA_PATH)
    print(f"Cleaned dataset shape: {df.shape}, No-show rate: {df['target'].mean():.2%}")

    X = df[FEATURE_COLS].to_numpy(dtype=np.float32)
    y = df["target"].to_numpy(dtype=int)

    tr_idx, te_idx = stratified_split_indices(y, test_size=0.2, seed=42)
    X_train, X_test = X[tr_idx], X[te_idx]
    y_train, y_test = y[tr_idx], y[te_idx]

    models = {
        "DecisionTree": DecisionTreeClassifier(
            max_depth=8, min_samples_leaf=30, class_weight="balanced", random_state=42
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=150, max_depth=14, min_samples_leaf=10,
            class_weight="balanced", n_jobs=-1, random_state=42
        ),
        "HistGradientBoosting": HistGradientBoostingClassifier(
            max_iter=200, learning_rate=0.08, max_depth=8,
            class_weight="balanced", random_state=42
        ),
    }

    results = []
    trained_models = {}
    for name, mdl in models.items():
        print(f"Training {name} ...")
        mdl.fit(X_train, y_train)
        probs = mdl.predict_proba(X_test)[:, 1]
        opt_th = find_optimal_threshold(y_test, probs)
        metrics = binary_classification_metrics(y_test, probs, threshold=opt_th)
        metrics["name"] = name
        metrics["threshold"] = opt_th
        metrics["probs"] = probs
        results.append(metrics)
        trained_models[name] = mdl
        print(
            f"  -> Accuracy={metrics['accuracy']:.4f}, Precision={metrics['precision']:.4f}, "
            f"Recall={metrics['recall']:.4f}, F1={metrics['f1']:.4f}, ROC-AUC={metrics['roc_auc']:.4f} (th={opt_th})"
        )

    best_res = max(results, key=lambda r: r["roc_auc"])
    best_name = best_res["name"]
    best_model = trained_models[best_name]
    print(f"\nBest No-Show model: {best_name} (ROC-AUC={best_res['roc_auc']:.4f}, F1={best_res['f1']:.4f})")

    bundle = {
        "model": best_model,
        "model_name": best_name,
        "features": FEATURE_COLS,
        "optimal_threshold": best_res["threshold"],
        "dataset": "joniarroba/noshowappointments",
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "noshow_rate": round(float(y.mean()), 4),
        "metrics": {k: v for k, v in best_res.items() if k != "probs"},
    }
    model_path = os.path.join(MODEL_DIR, "noshow_model.joblib")
    joblib.dump(bundle, model_path)
    print(f"Saved model bundle to {model_path}")

    metrics_out = {
        "dataset": "joniarroba/noshowappointments",
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "noshow_rate": round(float(y.mean()), 4),
        "best_model": best_name,
        "comparison": [{k: v for k, v in r.items() if k != "probs"} for r in results],
    }
    with open(os.path.join(MODEL_DIR, "noshow_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics_out, f, indent=2, ensure_ascii=False)

    fig, axes = plt.subplots(1, 3, figsize=(16, 5), dpi=200)
    for r in results:
        fpr, tpr = compute_roc_curve(y_test, r["probs"])
        axes[0].plot(fpr, tpr, lw=2, label=f"{r['name']} (AUC={r['roc_auc']:.3f})")
    axes[0].plot([0, 1], [0, 1], "k--", lw=1)
    axes[0].set_title("ROC Curve - Du doan vang mat No-Show", fontsize=11, fontweight="bold")
    axes[0].set_xlabel("False Positive Rate")
    axes[0].set_ylabel("True Positive Rate")
    axes[0].legend(loc="lower right", fontsize=8)
    axes[0].grid(alpha=0.3)

    rf_mdl = trained_models["RandomForest"]
    imp = pd.Series(rf_mdl.feature_importances_, index=FEATURE_COLS).sort_values()
    imp.plot(kind="barh", ax=axes[1], color="#2563eb")
    axes[1].set_title("Muc do anh huong cua dac trung", fontsize=11, fontweight="bold")
    axes[1].set_xlabel("Importance Score")
    axes[1].grid(axis="x", alpha=0.3)

    df_plot = df.copy()
    df_plot["lead_bucket"] = pd.cut(
        df_plot["lead_time_days"],
        bins=[-1, 0, 3, 7, 14, 30, 1000],
        labels=["Trong ngay", "1-3 ngay", "4-7 ngay", "8-14 ngay", "15-30 ngay", ">30 ngay"],
    )
    rate_by_lead = df_plot.groupby("lead_bucket", observed=False)["target"].mean() * 100
    rate_by_lead.plot(kind="bar", ax=axes[2], color="#0d9488", rot=25)
    axes[2].set_title("Ty le bo hen theo so ngay dat truoc", fontsize=11, fontweight="bold")
    axes[2].set_ylabel("Ty le No-Show (%)")
    axes[2].grid(axis="y", alpha=0.3)

    plt.tight_layout()
    chart_path = os.path.join(CHART_DIR, "noshow_evaluation.png")
    plt.savefig(chart_path, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved evaluation chart to {chart_path}")


if __name__ == "__main__":
    main()
