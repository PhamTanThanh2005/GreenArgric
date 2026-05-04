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
📦 project-root
├── 📂 public/             # Tài nguyên public, không qua quá trình build của Webpack/Vite
│   └── 📂 images/         # Các hình ảnh chung (logo, ảnh mặc định...)
│
└── 📂 src/                # Toàn bộ mã nguồn chính của ứng dụng React
    ├── 📂 assets/         # Tài nguyên tĩnh cục bộ (được bundle khi build)
    │   ├── 📂 device/     # Icon các thiết bị (đèn LED, máy bơm...)
    │   ├── 📂 sensors/    # Icon các cảm biến (độ ẩm, nhiệt độ, ánh sáng...)
    │   └── 📂 storage/    # Hình ảnh minh họa cho khu vực lưu trữ
    │
    ├── 📂 components/     # Shared UI Components (Dumb components) dùng chung toàn app
    │   ├── 📂 Button/     # Các nút bấm có thể tái sử dụng
    │   ├── 📂 Card/       # Layout thẻ cơ bản
    │   ├── 📂 Charts/     # Biểu đồ Recharts (DeviceDurationChart, EnvHistoryChart...)
    │   ├── 📂 Modal/      # Cửa sổ popup (Modals/Dialogs)
    │   ├── 📂 Navigation/ # Các thành phần điều hướng phụ
    │   └── 📂 Sidebar/    # Thanh điều hướng chính, thanh thông báo (RightSidebar)
    │
    ├── 📂 features/       # TRÁI TIM CỦA DỰ ÁN: Phân chia theo từng nghiệp vụ độc lập
    │   ├── 📂 auth/       # Nghiệp vụ Đăng nhập/Xác thực (chứa API, UI form, hook useLogin)
    │   ├── 📂 dashboard/  # Thống kê & Giám sát (SensorCard, WeatherCard, ZoneCard)
    │   ├── 📂 device/     # Quản lý thiết bị IoT (DeviceList, DeviceCard, gọi API ON/OFF)
    │   ├── 📂 notification/ # Xử lý cảnh báo/thông báo
    │   ├── 📂 threshold/  # Cài đặt ngưỡng an toàn (môi trường, đất)
    │   └── 📂 user/       # Quản lý hồ sơ cá nhân và người dùng
    │
    ├── 📂 hooks/          # Global Custom Hooks (dùng chung cho nhiều tính năng)
    │
    ├── 📂 layouts/        # Cấu trúc khung trang (Layout Wrappers)
    │   ├── AdminDashboardLayout.tsx  # Khung trang cho Admin
    │   ├── DashboardLayout.tsx       # Khung trang cho Chủ nông trại/Người dùng
    │   └── PublicLayout.tsx          # Khung trang cho luồng chưa đăng nhập
    │
    ├── 📂 pages/          # Smart Components: Nơi ghép nối các Layouts, Features và Components
    │   ├── AdminDashboardPage.tsx
    │   ├── ControlDevicePage.tsx
    │   ├── LandingPage.tsx
    │   └── ProfilePage.tsx
    │
    ├── 📂 routes/         # Cấu hình định tuyến (React Router)
    │   ├── AdminRoute.tsx # Component bảo vệ route của Admin (Private Route)
    │   └── index.tsx      # Khai báo toàn bộ đường dẫn ứng dụng
    │
    ├── 📂 services/       # Cấu hình kết nối HTTP dùng chung
    │   └── axiosClient.ts # Interceptors xử lý token, catch error chung
    │
    └── 📂 utils/          # Các hàm tiện ích (Utility functions)
        ├── api.ts         # Tiện ích liên quan đến API endpoint
        └── index.ts       # Các hàm helpers (VD: format ngày tháng, hàm gộp class `cn`)

```

## Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt:
```text
- Node.js: Phiên bản >= 18.x
- npm (>= 9.x) hoặc yarn (>= 1.22)
```

## Hướng dẫn Cài đặt & Khởi chạy (Getting Started)
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
Dự án sẽ chạy tại: `http://localhost:5173`




