# 🌿GREEN ARGRIC
Green Argric là hệ thống quản trị và giám sát nông nghiệp thông minh toàn diện. Dự án cho phép chủ vườn giám sát các thông số môi trường (Nhiệt độ, Độ ẩm, Ánh sáng) theo thời gian thực và điều khiển thiết bị (Máy bơm, Đèn) thông qua giao thức MQTT, kết hợp với bộ máy tự động hóa thông minh.

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">GREEN ARGRIC</h3>

  <p align="center">
    <br />
    <a href="backend/README.md"><strong>Explore Backend Docs »</strong></a>
    ·
    <a href="frontend/README.md"><strong>Explore Frontend Docs »</strong></a>
    <br />
  </p>
</div>

## 🛠 Built With

- [![React][React.js]][React-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Vite][Vite]][Vite-url]
- [![TailwindCSS][TailwindCSS]][TailwindCSS-url]
- [![Node.js][Node.js]][Node-url]
- [![Express.js][Express.js]][Express-url]
- [![SQL Server][SQLServer]][SQLServer-url]
- [![MQTT][MQTT]][MQTT-url]

## 🚀 Công nghệ sử dụng (Tech Stack)
### Frontend
* Core: React 18, TypeScript, Vite.

* Styling: Tailwind CSS.

* Charts: Recharts (Trực quan hóa dữ liệu cảm biến & thiết bị).

* Architecture: Feature-Driven Architecture (FDA).

### Backend
* Runtime: Node.js & Express.js.

* Database: SQL Server (MSSQL).

* IoT Protocol: MQTT (mqtt.js).

* Security: JSON Web Token (JWT) & bcrypt.

* Documentation: Swagger UI.

## 📂 Cấu trúc dự án
Dự án được chia thành hai phần chính:

`/backend:` Chứa mã nguồn máy chủ API, logic tự động hóa và kết nối MQTT.

`/frontend:` Chứa mã nguồn giao diện người dùng React theo mô hình hướng tính năng.

## 🛠️ Tính năng cốt lõi
1. **Giám sát thời gian thực:** Cập nhật thông số nhiệt độ, độ ẩm đất/không khí và ánh sáng qua MQTT.

2. **Điều khiển thông minh:**
*Thủ công*: Ghi đè trạng thái thiết bị có hẹn giờ hết hạn.
*Tự động*: Tự động bật/tắt thiết bị dựa trên ngưỡng cấu hình (VD: Tự tưới khi đất khô).

3. **Quản lý đa khu vực**: Hỗ trợ phân quyền Admin (toàn quyền) và Owner (chỉ quản lý khu vực được giao).

4. **Cảnh báo tức thời**: Gửi thông báo khi môi trường vượt ngưỡng an toàn.

5. **Lịch sử & Thống kê**: Lưu trữ và biểu đồ hóa lịch sử cảm biến và hoạt động của thiết bị.

## 🚦 Hướng dẫn cài đặt
1. **Yêu cầu hệ thống**
Node.js v18.x trở lên.
SQL Server (Bản Developer hoặc Express).
MQTT Account (OhStem Server).
2. **Thiết lập Backend**
```bash
cd backend
npm install
# Cấu hình .env (Database, JWT_SECRET, MQTT_USERNAME...)
node index.js
```
API Documentation truy cập tại: `http://localhost:3000/api`

3. **Thiết lập Frontend**
```bash
cd frontend
npm install
npm run dev
```
Giao diện chạy tại: `http://localhost:5173`


[React.js]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vite]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[TailwindCSS]: https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[Node.js]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com/
[SQLServer]: https://img.shields.io/badge/Microsoft%20SQL%20Server-CC292B?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white
[SQLServer-url]: https://www.microsoft.com/en-us/sql-server
[MQTT]: https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white
[MQTT-url]: https://mqtt.org/
