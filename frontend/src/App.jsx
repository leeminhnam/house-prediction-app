import React, { useState } from 'react';
import './App.css';

function App() {
  // Khởi tạo state cho form nhập liệu
  const [formData, setFormData] = useState({
    modelType: 'gradient_boosting',
    Address: 'Dự án The Empire - Vinhomes Ocean Park 2, Xã Long Hưng, Văn Giang, Hưng Yên',
    Area: 84,
    Frontage: 5.0,
    'Access Road': 13.0,
    'House direction': 'East',
    'Balcony direction': 'East',
    Floors: 4,
    Bedrooms: 4,
    Bathrooms: 3,
    'Legal status': 'Have certificate',
    'Furniture state': 'Unknown',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  // Nạp dữ liệu mẫu nhanh (Presets)
  const loadPreset = (type) => {
    if (type === 'vinhomes') {
      setFormData(prev => ({
        ...prev,
        Address: 'Dự án The Empire - Vinhomes Ocean Park 2, Xã Long Hưng, Văn Giang, Hưng Yên',
        Area: 84,
        Frontage: 5.0,
        'Access Road': 13.0,
        'House direction': 'East',
        'Balcony direction': 'East',
        Floors: 4,
        Bedrooms: 4,
        Bathrooms: 3,
        'Legal status': 'Have certificate',
        'Furniture state': 'Full',
      }));
    } else if (type === 'townhouse') {
      setFormData(prev => ({
        ...prev,
        Address: 'Phố Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
        Area: 45,
        Frontage: 4.2,
        'Access Road': 6.0,
        'House direction': 'South',
        'Balcony direction': 'South',
        Floors: 5,
        Bedrooms: 3,
        Bathrooms: 4,
        'Legal status': 'Have certificate',
        'Furniture state': 'Basic',
      }));
    }
  };

  // Gửi request định giá đến Flask API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict_price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Lỗi kết nối Server: HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Dự đoán không thành công, vui lòng kiểm tra lại!');
      }
    } catch (err) {
      setError('Không thể kết nối tới Flask API (http://127.0.0.1:8000). Hãy đảm bảo bạn đã khởi chạy backend bằng lệnh: python main.py');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* HEADER NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo-group">
            <span className="logo-icon">🏡</span>
            <div>
              <h2>AI Định Giá Bất Động Sản</h2>
              <p>Hệ thống dự đoán giá trị nhà thông minh sử dụng Machine Learning</p>
            </div>
          </div>
          <div className="preset-buttons">
            <span className="preset-label">Mẫu thử:</span>
            <button type="button" className="btn-preset btn-preset-vh" onClick={() => loadPreset('vinhomes')}>
              Biệt thự Vinhomes
            </button>
            <button type="button" className="btn-preset btn-preset-hn" onClick={() => loadPreset('townhouse')}>
              Nhà phố Hà Nội
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="main-grid">
        {/* KHỐI FORM NHẬP THÔNG TIN */}
        <section className="form-card">
          <form onSubmit={handleSubmit}>
            {/* 0. Chọn mô hình AI */}
            <div className="section-block">
              <h3 className="section-title">
                <span className="step-num">0</span> Chọn Mô Hình AI
              </h3>
              <div className="input-group">
                <label>Mô hình dự đoán:</label>
                <select name="modelType" value={formData.modelType} onChange={handleChange}>
                  <option value="gradient_boosting">Gradient Boosting Regressor (Mặc định)</option>
                  <option value="mlp">Deep Learning (Multi-Layer Perceptron)</option>
                </select>
              </div>
            </div>

            {/* 1. Vị trí & Địa chỉ */}
            <div className="section-block">
              <h3 className="section-title">
                <span className="step-num">1</span> Vị trí & Địa chỉ Bất Động Sản
              </h3>
              <div className="input-group">
                <label>Địa chỉ chi tiết / Dự án:</label>
                <input
                  type="text"
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ hoặc tên dự án..."
                  required
                />
                <span className="helper-text">* Tỉnh/Thành sẽ được tự động trích xuất từ địa chỉ</span>
              </div>
            </div>

            {/* 2. Thông số hình học */}
            <div className="section-block">
              <h3 className="section-title">
                <span className="step-num">2</span> Diện tích & Mặt tiền
              </h3>
              <div className="grid-3-col">
                <div className="input-group">
                  <label>Diện tích (m²):</label>
                  <input
                    type="number"
                    name="Area"
                    min="10"
                    step="0.1"
                    value={formData.Area}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Mặt tiền (m):</label>
                  <input
                    type="number"
                    name="Frontage"
                    min="0"
                    step="0.1"
                    value={formData.Frontage}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Đường vào (m):</label>
                  <input
                    type="number"
                    name="Access Road"
                    min="0"
                    step="0.1"
                    value={formData['Access Road']}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 3. Kết cấu công trình */}
            <div className="section-block">
              <h3 className="section-title">
                <span className="step-num">3</span> Kết cấu Nhà ở
              </h3>
              <div className="grid-3-col">
                <div className="input-group">
                  <label>Số tầng:</label>
                  <input
                    type="number"
                    name="Floors"
                    min="1"
                    max="50"
                    value={formData.Floors}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Phòng ngủ:</label>
                  <input
                    type="number"
                    name="Bedrooms"
                    min="1"
                    value={formData.Bedrooms}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Phòng tắm:</label>
                  <input
                    type="number"
                    name="Bathrooms"
                    min="1"
                    value={formData.Bathrooms}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 4. Phong thủy, Pháp lý & Nội thất */}
            <div className="section-block">
              <h3 className="section-title">
                <span className="step-num">4</span> Phong thủy & Pháp lý
              </h3>
              <div className="grid-2-col">
                <div className="input-group">
                  <label>Hướng nhà:</label>
                  <select name="House direction" value={formData['House direction']} onChange={handleChange}>
                    <option value="East">Đông (East)</option>
                    <option value="West">Tây (West)</option>
                    <option value="South">Nam (South)</option>
                    <option value="North">Bắc (North)</option>
                    <option value="Southeast">Đông Nam</option>
                    <option value="Northeast">Đông Bắc</option>
                    <option value="Southwest">Tây Nam</option>
                    <option value="Northwest">Tây Bắc</option>
                    <option value="Unknown">Không xác định</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Hướng ban công:</label>
                  <select name="Balcony direction" value={formData['Balcony direction']} onChange={handleChange}>
                    <option value="East">Đông (East)</option>
                    <option value="West">Tây (West)</option>
                    <option value="South">Nam (South)</option>
                    <option value="North">Bắc (North)</option>
                    <option value="Southeast">Đông Nam</option>
                    <option value="Northeast">Đông Bắc</option>
                    <option value="Southwest">Tây Nam</option>
                    <option value="Northwest">Tây Bắc</option>
                    <option value="Unknown">Không xác định</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Tình trạng pháp lý:</label>
                  <select name="Legal status" value={formData['Legal status']} onChange={handleChange}>
                    <option value="Have certificate">Sổ đỏ / Sổ hồng (Have certificate)</option>
                    <option value="Sale contract">Hợp đồng mua bán (Sale contract)</option>
                    <option value="Waiting certificate">Đang chờ sổ</option>
                    <option value="Unknown">Khác / Chưa rõ</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Nội thất:</label>
                  <select name="Furniture state" value={formData['Furniture state']} onChange={handleChange}>
                    <option value="Full">Đầy đủ nội thất cao cấp (Full)</option>
                    <option value="Basic">Nội thất cơ bản (Basic)</option>
                    <option value="Raw">Bàn giao thô (Raw)</option>
                    <option value="Unknown">Không xác định</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang phân tích & tính toán...' : '🏷️ Định Giá Bất Động Sản Ngay'}
            </button>
          </form>
        </section>

        {/* KHỐI KẾT QUẢ DỰ ĐOÁN */}
        <section className="result-section">
          {error && (
            <div className="alert-box alert-error">
              <strong>⚠️ Lỗi:</strong> {error}
            </div>
          )}

          {loading && (
            <div className="loading-card">
              <div className="spinner"></div>
              <p>Mô hình Machine Learning đang trích xuất đặc trưng và tính toán giá trị căn nhà...</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Chưa có kết quả định giá</h3>
              <p>Điền các thông số bất động sản bên trái hoặc nhấn vào nút <b>Mẫu thử</b> rồi bấm <b>Định Giá</b> để nhận kết quả tức thời.</p>
            </div>
          )}

          {!loading && result && (
            <div className="result-card">
              <div className="result-header">
                <span className="badge-model">MÔ HÌNH: {result.model_used}</span>
                <span className="result-timestamp">{new Date().toLocaleTimeString('vi-VN')}</span>
              </div>

              <div className="price-display-box">
                <div className="price-sub-label">Ước tính giá trị bất động sản</div>
                <div className="price-main-value">{result.formatted_price}</div>
                <div className="unit-price-tag">
                  Đơn giá tương đương: ~{((result.predicted_price_billion * 1000) / (formData.Area || 1)).toFixed(1)} Triệu/m²
                </div>
              </div>

              <div className="summary-specs">
                <div className="spec-item">
                  <span className="spec-label">📐 Diện tích:</span>
                  <span className="spec-val">{formData.Area} m²</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">🏢 Số tầng:</span>
                  <span className="spec-val">{formData.Floors} tầng</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">🛏️ Phòng ngủ:</span>
                  <span className="spec-val">{formData.Bedrooms} PN</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">📜 Pháp lý:</span>
                  <span className="spec-val">{formData['Legal status']}</span>
                </div>
              </div>

              <div className="market-advice-box">
                <h4>💡 Lưu ý & Phân tích thị trường:</h4>
                <ul>
                  <li>Mức giá dự đoán phản ánh mặt bằng chung thị trường dựa trên các đặc trưng diện tích, kết cấu và vị trí.</li>
                  <li>Giá thực tế có thể biến động ±5-10% tùy thuộc vào mặt tiền view thực tế, tiến độ bàn giao và biến động thị trường khu vực.</li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;