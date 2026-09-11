# Hệ Thống Dự Đoán Giá Nhà (House Price Prediction App)

## 📌 Giới Thiệu
Đây là một hệ thống ứng dụng AI dự đoán giá nhà dựa trên các đặc trưng của bất động sản (như diện tích, mặt tiền, số tầng, số phòng ngủ, phòng tắm, hướng nhà, tỉnh thành, pháp lý, nội thất...). 
Hệ thống sử dụng các thuật toán học máy (Gradient Boosting, Random Forest, Decision Tree, Ridge Regression, K-Nearest Neighbors) và học sâu (Deep Learning - MLP với PyTorch) để phân tích dữ liệu và cung cấp mức giá dự đoán ước tính sát với thị trường.

## 📁 Cấu Trúc Thư Mục

```text
house-prediction-app/
│
├── backend/                  # Mã nguồn Backend (FastAPI, Machine Learning)
│   ├── DATA/                 # Chứa dữ liệu
│   │   └── vietnam_housing_dataset.csv # Tập dữ liệu huấn luyện mẫu
│   ├── models/               # Chứa các file mô hình đã huấn luyện (.pkl, .pth, .json)
│   ├── main.py               # File chạy server FastAPI (API endpoints)
│   ├── requirements.txt      # Danh sách thư viện Python cần thiết
│
├── frontend/                 # Mã nguồn Frontend (ReactJS + Vite)
│   ├── src/                  # Mã nguồn giao diện (Components, Hooks, Services...)
│   ├── public/               # Các file tĩnh (Icons, images...)
│   ├── package.json          # Danh sách thư viện Node.js cần thiết
│   └── vite.config.js        # Cấu hình build của Vite
│
├── .gitignore                # Các file bị bỏ qua khi dùng Git
└── README.md                 # Tài liệu hướng dẫn sử dụng hệ thống (File bạn đang đọc)
```

## 🛠 Công Nghệ Sử Dụng

### Backend (AI/ML & API Server)
- **Ngôn ngữ:** Python
- **Framework API:** FastAPI, Uvicorn (cho tốc độ phản hồi cực nhanh, hỗ trợ bất đồng bộ)
- **Machine Learning / AI:** Scikit-Learn, PyTorch, Pandas, NumPy, Joblib

### Frontend (Giao diện người dùng)
- **Công nghệ chính:** ReactJS (v19)
- **Trình đóng gói:** Vite
- **Ngôn ngữ:** JavaScript / JSX

---

## 🚀 Hướng Dẫn Clone, Cài Đặt & Khởi Chạy

### 1. Tải Mã Nguồn Về Máy (Clone)
Mở Terminal (hoặc Git Bash / Command Prompt) và chạy lệnh sau để clone source code từ GitHub:

```bash
git clone https://github.com/leeminhnam/house-prediction-app.git
cd house-prediction-app
```

### 2. Cài Đặt và Khởi Chạy Backend (Python - FastAPI)
> **Yêu cầu:** Máy tính đã cài đặt [Python](https://www.python.org/) (khuyên dùng Python 3.9 trở lên).

Từ thư mục gốc của project, thực hiện các lệnh sau:

```bash
# Di chuyển vào thư mục backend
cd backend

# (Tùy chọn nhưng khuyên dùng) Tạo môi trường ảo:
# python -m venv venv
# venv\Scripts\activate      (Với Windows)
# source venv/bin/activate   (Với Mac/Linux)

# Cài đặt các thư viện yêu cầu
pip install -r requirements.txt

# Khởi chạy server FastAPI
python main.py
```
✅ **Thành công:** Server Backend sẽ chạy tại: `http://localhost:8000`. Bạn có thể truy cập Swagger UI để test API tại `http://localhost:8000/docs`.

### 3. Cài Đặt và Khởi Chạy Frontend (Node.js - React)
> **Yêu cầu:** Máy tính đã cài đặt [Node.js](https://nodejs.org/).

Mở một cửa sổ Terminal **mới** (vẫn giữ nguyên terminal Backend đang chạy), từ thư mục gốc của dự án thực hiện:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các thư viện dependencies của React
npm install

# Khởi chạy môi trường phát triển (Development mode)
npm run dev
```
✅ **Thành công:** Giao diện Frontend sẽ khởi chạy, thường tại địa chỉ `http://localhost:5173`. Click chuột vào link hiện trên terminal hoặc mở trình duyệt web và dán địa chỉ đó vào để sử dụng ứng dụng.

---
💡 *Chúc bạn có trải nghiệm tuyệt vời với ứng dụng Hệ Thống Dự Đoán Giá Nhà!*