# 🌿 GREEN ARGRIC - FRONTEND

> Hệ thống quản trị và giám sát nông nghiệp thông minh (Smart IoT Greenhouse).

Green Argric là một nền tảng Web Application hiện đại, được thiết kế để giúp chủ vườn và quản trị viên giám sát thông số môi trường theo thời gian thực (Nhiệt độ, Độ ẩm, Ánh sáng) và điều khiển các thiết bị phần cứng IoT (Máy bơm, Đèn LED) thông qua MQTT.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

- **Core:** React 18, TypeScript, Vite (Build tool).
- **Styling:** Tailwind CSS.
- **Routing:** React Router v6.
- **Charts & Data Visualization:** Recharts.
- **Icons:** Lucide React.
- **IoT Integration:** MQTT Server.
- **Architecture:** Feature-Driven Architecture (FDA).

---

## 🏗 Kiến trúc dự án (Project Architecture)

Dự án này áp dụng mô hình **Feature-Driven Architecture** nhằm đảm bảo tính Module hóa (Modularity), dễ bảo trì (Maintainability) và dễ mở rộng (Scalability).

```text
src/
├── assets/        # Hình ảnh, fonts, icons tĩnh cục bộ.
├── components/    # Shared UI Components (Dumb components): Nút, Thẻ, Modal... Dùng chung toàn app.
├── features/      # Phân chia theo nghiệp vụ (Domain-driven). Mỗi feature hoạt động độc lập.
│   ├── auth/      # Xử lý đăng nhập, phân quyền.
│   ├── dashboard/ # Giao diện biểu đồ, thống kê thời tiết.
│   └── device/    # Quản lý thiết bị IoT (ON/OFF, overrides).
├── hooks/         # Custom Hooks dùng chung toàn global.
├── layouts/       # Cấu trúc khung trang (VD: PublicLayout, DashboardLayout chứa Sidebar & Header).
├── pages/         # Smart Components: Nơi ghép nối các Features và Layouts lại với nhau.
├── routes/        # Cấu hình định tuyến (React Router).
├── services/      # Các service gọi API dùng chung, cấu hình Axios/Fetch interceptors.
├── store/         # Quản lý Global State (Redux / Zustand).
├── types/         # Khai báo TypeScript Interfaces / Types dùng chung.
└── utils/         # Các hàm tiện ích (VD: format date, hàm gộp class `cn`).

```

## Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt:
```text
- Node.js: Phiên bản >= 18.x
- npm (>= 9.x) hoặc yarn (>= 1.22)
```

## Hướng dẫn Cài đặt & Khởi chạy (Getting Started)
### Clone dự án
```bash
git clone https://github.com/PhamTanThanh2005/green-argric.git
cd frontend
```
### Cài đặt thư viện (Dependencies)
```bash
npm install
# hoặc
yarn install
```

###  Khởi chạy dự án (Development Mode)
```bash
npm run dev
# hoặc
yarn dev
```
Dự án sẽ chạy tại: **http://localhost:5173 ** (Cổng mặc định của Vite).




