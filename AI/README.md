# MediCare AI Service (Kaggle Machine Learning Module)

Thư mục `AI` chứa các tập dữ liệu thực tế tải từ **Kaggle**, mã nguồn Python huấn luyện, biểu đồ đánh giá và dịch vụ FastAPI tích hợp trực tiếp vào Backend Spring Boot của hệ thống MediCare.

## 1. Cấu trúc thư mục
- `download_kaggle_data.py`: Tải tự động 2 bộ dữ liệu từ Kaggle qua `kagglehub`.
- `ml_utils.py`: Hàm chia tập dữ liệu phân tầng (Stratified Split) và tính các chỉ số đánh giá (Accuracy, Precision, Recall, F1, ROC-AUC).
- `train_noshow_model.py`: Huấn luyện và so sánh `DecisionTree`, `RandomForest`, `HistGradientBoosting` trên tập **Medical Appointment No Shows** (`110,521` bản ghi sau làm sạch).
- `train_symptom_model.py`: Huấn luyện mô hình phân loại bệnh & điều hướng chuyên khoa từ **Disease Symptom Description Dataset** (`4,920` bản ghi, `41` nhóm bệnh, `133` triệu chứng).
- `symptom_mapper.py`: Bộ ánh xạ triệu chứng tiếng Việt sang từ vựng lâm sàng của bộ dữ liệu Kaggle.
- `app.py`: Dịch vụ REST API bằng FastAPI chạy ở cổng `8000`.
- `data/`, `models/`, `charts/`: Lưu dữ liệu CSV gốc, mô hình `.joblib` đã huấn luyện, file JSON chỉ số và biểu đồ đánh giá `.png`.

## 2. Khởi chạy
```powershell
cd D:\DATN\AI
py app.py
```
- Tài liệu API tương tác: `http://127.0.0.1:8000/docs`
- Kiểm tra sức khỏe mô hình: `http://127.0.0.1:8000/health`
