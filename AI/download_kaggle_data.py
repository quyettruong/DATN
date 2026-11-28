"""Download real medical datasets from Kaggle using kagglehub and copy to AI/data."""

import os
import shutil
import kagglehub


def copy_csvs(src_dir: str, dest_dir: str) -> list[str]:
    os.makedirs(dest_dir, exist_ok=True)
    copied = []
    for root, _, files in os.walk(src_dir):
        for fname in files:
            if fname.lower().endswith(".csv"):
                src_path = os.path.join(root, fname)
                dst_path = os.path.join(dest_dir, fname)
                shutil.copy2(src_path, dst_path)
                copied.append(dst_path)
    return copied


def main() -> None:
    base_data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

    print("1. Downloading Kaggle dataset: joniarroba/noshowappointments ...")
    noshow_cache = kagglehub.dataset_download("joniarroba/noshowappointments")
    noshow_files = copy_csvs(noshow_cache, os.path.join(base_data_dir, "noshow"))
    print("   Copied:", noshow_files)

    print("2. Downloading Kaggle dataset: itachi9604/disease-symptom-description-dataset ...")
    symptom_cache = kagglehub.dataset_download("itachi9604/disease-symptom-description-dataset")
    symptom_files = copy_csvs(symptom_cache, os.path.join(base_data_dir, "symptoms"))
    print("   Copied:", symptom_files)


if __name__ == "__main__":
    main()
