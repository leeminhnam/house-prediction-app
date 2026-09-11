import os
import json
import joblib
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict

app = FastAPI(title="House Price Prediction API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define MLP architecture
class DeeperHousingMLP(nn.Module):
    def __init__(self, input_dim=11):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(64, 32)
        self.relu2 = nn.ReLU()
        self.fc_out = nn.Linear(32, 1)

    def forward(self, x):
        h1 = self.relu1(self.fc1(x))
        h2 = self.relu2(self.fc2(h1))
        return self.fc_out(h2)

# Global variables for models
gb_model = None
gb_scaler = None
gb_columns = None

mlp_model = None
mlp_X_mean = None
mlp_X_std = None
mlp_y_mean = None
mlp_y_std = None
mlp_cat_categories = {}
mlp_features = []

@app.on_event("startup")
def load_models():
    global gb_model, gb_scaler, gb_columns
    global mlp_model, mlp_X_mean, mlp_X_std, mlp_y_mean, mlp_y_std, mlp_cat_categories, mlp_features

    # 1. Load Gradient Boosting model
    gb_dir = os.path.join(os.path.dirname(__file__), 'models', 'gradient_boosting')
    gb_model = joblib.load(os.path.join(gb_dir, 'best_house_model.pkl'))
    gb_scaler = joblib.load(os.path.join(gb_dir, 'scaler_house.pkl'))
    with open(os.path.join(gb_dir, 'house_model_columns.json'), 'r', encoding='utf-8') as f:
        gb_columns = json.load(f)

    # 2. Setup MLP Model and its preprocessing params
    df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'DATA', 'vietnam_housing_dataset.csv'))
    price_cols = [c for c in df.columns if 'price' in c.lower()]
    TARGET_COL = price_cols[0] if len(price_cols) > 0 else df.columns[-1]

    df_processed = df.copy()
    for col in df_processed.columns:
        if col != TARGET_COL:
            if not pd.api.types.is_numeric_dtype(df_processed[col]):
                df_processed[col] = df_processed[col].astype('category')
                mlp_cat_categories[col] = df_processed[col].cat.categories
                df_processed[col] = df_processed[col].cat.codes

    df_processed[TARGET_COL] = pd.to_numeric(df_processed[TARGET_COL], errors='coerce')
    df_processed = df_processed.dropna()

    X = df_processed.drop(columns=[TARGET_COL]).values.astype(np.float32)
    y = df_processed[TARGET_COL].values.astype(np.float32).reshape(-1, 1)
    mlp_features = list(df_processed.drop(columns=[TARGET_COL]).columns)

    np.random.seed(42)
    N = len(X)
    indices = np.random.permutation(N)
    train_end = int(0.70 * N)
    train_idx = indices[:train_end]
    X_train = X[train_idx]
    y_train = y[train_idx]

    mlp_X_mean = X_train.mean(axis=0)
    mlp_X_std = X_train.std(axis=0) + 1e-8
    mlp_y_mean = y_train.mean()
    mlp_y_std = y_train.std() + 1e-8

    input_dim = X_train.shape[1]
    mlp_model = DeeperHousingMLP(input_dim=input_dim)
    mlp_dir = os.path.join(os.path.dirname(__file__), 'models', 'mlp')
    mlp_model.load_state_dict(torch.load(os.path.join(mlp_dir, 'vietnam_housing_mlp_best.pth'), map_location='cpu'))
    mlp_model.eval()

@app.get('/')
def health_check():
    return {
        "status": "online",
        "message": "FastAPI House Price Prediction đang hoạt động!"
    }

@app.post('/predict_price')
def predict_price(data: dict):
    if not data:
        raise HTTPException(status_code=400, detail="Không nhận được dữ liệu đầu vào!")

    try:
        model_type = data.get('modelType', 'gradient_boosting')

        if model_type == 'gradient_boosting':
            # ================= Gradient Boosting Prediction =================
            # Mapping hướng từ tiếng Anh (FE) → tiếng Việt (đúng với lúc train)
            direction_map = {
                'East': 'Đông',
                'West': 'Tây',
                'South': 'Nam',
                'North': 'Bắc',
                'Southeast': 'Đông - Nam',
                'Northeast': 'Đông - Bắc',
                'Southwest': 'Tây - Nam',
                'Northwest': 'Tây - Bắc',
                'Unknown': 'Unknown',
            }

            input_data = data.copy()
            # Xóa các key không phải feature
            input_data.pop('modelType', None)
            input_data['House direction'] = direction_map.get(input_data.get('House direction', 'Unknown'), 'Unknown')
            input_data['Balcony direction'] = direction_map.get(input_data.get('Balcony direction', 'Unknown'), 'Unknown')

            input_df = pd.DataFrame([input_data])
            if 'Address' in input_df.columns:
                parts = str(input_df['Address'].iloc[0]).split(',')
                province_raw = parts[-1].strip() if len(parts) > 0 else 'Unknown'
                # Normalize province: bỏ dấu chấm cuối nếu có
                province_raw = province_raw.rstrip('.')
                # Tìm province khớp trong mô hình (so sánh không phân biệt dấu chấm)
                matched_province = 'Unknown'
                model_cols = list(gb_model.feature_names_in_)
                for col in model_cols:
                    if col.startswith('Province_'):
                        prov_val = col[len('Province_'):]
                        if prov_val.rstrip('.') == province_raw:
                            matched_province = prov_val
                            break
                input_df['Province'] = matched_province
                input_df = input_df.drop(columns=['Address'])

            num_cols = ['Area', 'Frontage', 'Access Road', 'Floors', 'Bedrooms', 'Bathrooms']
            for col in num_cols:
                if col in input_df.columns:
                    input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0)

            cat_cols = ['House direction', 'Balcony direction', 'Legal status', 'Furniture state', 'Province']
            input_df_encoded = pd.get_dummies(input_df, columns=[c for c in cat_cols if c in input_df.columns])

            # Align theo đúng cột mà mô hình mong đợi (để tránh lỗi feature names mismatch)
            model_cols = list(gb_model.feature_names_in_)
            missing_cols = {col: [0] for col in model_cols if col not in input_df_encoded.columns}
            if missing_cols:
                input_df_encoded = pd.concat(
                    [input_df_encoded, pd.DataFrame(missing_cols, index=input_df_encoded.index)],
                    axis=1
                )
            input_df_processed = input_df_encoded[model_cols]

            # Kiểm tra xem mô hình có cần scale không
            model_name = type(gb_model).__name__
            if model_name in ["KNeighborsRegressor", "Ridge", "LinearRegression", "SVR"]:
                # Nếu model cần data đã scale, ta scale nó (chú ý: scaler có thể expect features khác,
                # nên cẩn thận. Nhưng ở đây best_model thường là tree-based)
                scaler_cols = list(gb_scaler.feature_names_in_)
                missing_scaler = {col: [0] for col in scaler_cols if col not in input_df_encoded.columns}
                if missing_scaler:
                    input_df_encoded_scaler = pd.concat(
                        [input_df_encoded, pd.DataFrame(missing_scaler, index=input_df_encoded.index)],
                        axis=1
                    )
                else:
                    input_df_encoded_scaler = input_df_encoded
                input_df_for_scaler = input_df_encoded_scaler[scaler_cols]

                X_scaled = gb_scaler.transform(input_df_for_scaler)
                X_final = pd.DataFrame(X_scaled, columns=scaler_cols)[model_cols]
            else:
                # Tree-based models (RandomForest, GradientBoosting, DecisionTree) không cần scale
                X_final = input_df_processed

            # Predict
            pred_price = gb_model.predict(X_final)[0]

        elif model_type == 'mlp':
            # ================= MLP Prediction =================
            # Must map input exactly as we mapped training data
            input_dict = data.copy()

            # Create a row matching mlp_features
            row = []
            for col in mlp_features:
                if col in mlp_cat_categories:
                    # Categorical feature
                    val = input_dict.get(col, '')
                    categories = mlp_cat_categories[col]
                    if val in categories:
                        code = categories.get_loc(val)
                    else:
                        code = -1 # Unknown
                    row.append(code)
                else:
                    # Numeric feature
                    val = input_dict.get(col, 0)
                    try:
                        val = float(val) if val != '' else 0.0
                    except:
                        val = 0.0
                    row.append(val)

            X_input = np.array([row], dtype=np.float32)
            X_input_norm = (X_input - mlp_X_mean) / mlp_X_std

            with torch.no_grad():
                pred_norm = mlp_model(torch.tensor(X_input_norm))
                pred_price = (pred_norm.item() * mlp_y_std) + mlp_y_mean

        else:
            return {"success": False, "message": "Model không hợp lệ!"}

        # Ép kiểu về Python float thuần để FastAPI serialize được
        pred_price = float(pred_price)
        pred_price = max(0.0, pred_price)

        if pred_price >= 1.0:
            formatted_price = f"{pred_price:.2f} Tỷ VNĐ"
        else:
            formatted_price = f"{pred_price * 1000:.0f} Triệu VNĐ"

        return {
            "success": True,
            "predicted_price_billion": round(pred_price, 3),
            "formatted_price": formatted_price,
            "model_used": "Gradient Boosting Regressor" if model_type == 'gradient_boosting' else "Deep Learning (MLP)"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)