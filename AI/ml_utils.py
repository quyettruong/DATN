"""Shared numpy/scipy evaluation and stratified splitting utilities."""

import numpy as np
from scipy.stats import rankdata


def stratified_split_indices(y: np.ndarray, test_size: float = 0.2, seed: int = 42):
    """Return stratified (train_idx, test_idx) without importing blocked sklearn DLLs."""
    rng = np.random.default_rng(seed)
    train_idx = []
    test_idx = []
    y_arr = np.asarray(y)
    for cls in np.unique(y_arr):
        cls_idx = np.where(y_arr == cls)[0]
        rng.shuffle(cls_idx)
        n_test = max(1, int(round(len(cls_idx) * test_size)))
        test_idx.append(cls_idx[:n_test])
        train_idx.append(cls_idx[n_test:])
    tr = np.concatenate(train_idx)
    te = np.concatenate(test_idx)
    rng.shuffle(tr)
    rng.shuffle(te)
    return tr, te


def binary_classification_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5) -> dict:
    """Compute exact Accuracy, Precision, Recall, F1, ROC-AUC, and confusion matrix."""
    y_t = np.asarray(y_true, dtype=int)
    y_p = (np.asarray(y_prob, dtype=float) >= threshold).astype(int)

    tp = int(np.sum((y_t == 1) & (y_p == 1)))
    tn = int(np.sum((y_t == 0) & (y_p == 0)))
    fp = int(np.sum((y_t == 0) & (y_p == 1)))
    fn = int(np.sum((y_t == 1) & (y_p == 0)))

    acc = (tp + tn) / max(1, len(y_t))
    prec = tp / max(1, tp + fp)
    rec = tp / max(1, tp + fn)
    f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

    # Exact ROC-AUC via Mann-Whitney U rank statistic
    pos = y_t == 1
    neg = y_t == 0
    n_pos = int(np.sum(pos))
    n_neg = int(np.sum(neg))
    if n_pos > 0 and n_neg > 0:
        ranks = rankdata(y_prob)
        sum_pos_ranks = float(np.sum(ranks[pos]))
        auc = (sum_pos_ranks - n_pos * (n_pos + 1) / 2.0) / (n_pos * n_neg)
    else:
        auc = 0.5

    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(float(auc), 4),
        "confusion_matrix": [[tn, fp], [fn, tp]],
    }


def compute_roc_curve(y_true: np.ndarray, y_prob: np.ndarray):
    """Compute (fpr, tpr) arrays for ROC plotting."""
    y_t = np.asarray(y_true, dtype=int)
    scores = np.asarray(y_prob, dtype=float)
    order = np.argsort(-scores, kind="mergesort")
    y_sorted = y_t[order]

    tps = np.cumsum(y_sorted)
    fps = np.cumsum(1 - y_sorted)
    total_pos = max(1, int(tps[-1]))
    total_neg = max(1, int(fps[-1]))

    fpr = np.concatenate([[0.0], fps / total_neg, [1.0]])
    tpr = np.concatenate([[0.0], tps / total_pos, [1.0]])
    return fpr, tpr


def multiclass_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """Compute exact Accuracy and Macro-F1 for multiclass classification."""
    yt = np.asarray(y_true)
    yp = np.asarray(y_pred)
    acc = float(np.mean(yt == yp))

    classes = np.unique(yt)
    f1s = []
    for c in classes:
        tp = int(np.sum((yt == c) & (yp == c)))
        fp = int(np.sum((yt != c) & (yp == c)))
        fn = int(np.sum((yt == c) & (yp != c)))
        p = tp / max(1, tp + fp)
        r = tp / max(1, tp + fn)
        f1s.append((2 * p * r / (p + r)) if (p + r) > 0 else 0.0)

    return {
        "accuracy": round(acc, 4),
        "macro_f1": round(float(np.mean(f1s)), 4),
    }
