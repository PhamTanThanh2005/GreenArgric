# GREEN ARGRIC - Backend API & MQTT Service

## Kiến trúc & Công nghệ
- Môi trường chạy: Node.js   
- Framework: Express.js   
- Cơ sở dữ liệu: SQL Server (MSSQL)   
- Giao thức IoT: MQTT (thông qua thư viện mqtt.js)   
- Xác thực & Bảo mật: JSON Web Token (JWT)

## Yêu cầu hệ thống
Để khởi chạy dự án tại local, máy tính của bạn cần cài đặt sẵn:

- Node.js (Phiên bản v16.x trở lên)
- Microsoft SQL Server (Bản Developer hoặc Express)
- Tài khoản Server MQTT OhStem (Dành cho việc nhận/gửi tín hiệu phần cứng)

## Cài đặt & Khởi chạy
### Cài đặt các thư viện
```bash
npm install
```

### Khởi tạo Database
```text
1. Mở SQL Server Management Studio (SSMS)
2. Tạo một Database mới có tên là green-farm (hoặc tên tuỳ chọn).
3. Chạy file script SQL tổng hợp để khởi tạo các bảng.
```
### Khởi chạy Server
```bash
node index.js
```
Server sẽ mặc định chạy tại: http://localhost:3000

## Cấu hình Biến môi trường (.env)
Tạo một file .env ở thư mục gốc của dự án và cấu hình các thông số sau:
```bash
# SERVER CONFIG
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here

# DATABASE CONFIG (SQL SERVER)
DB_USER=sa
DB_PASSWORD=your_sql_password
DB_SERVER=127.0.0.1
DB_PORT=1433
DB_NAME=green-farm

# MQTT CONFIG (OHSTEM)
MQTT_BROKER=wss://mqtt.ohstem.vn:8084/mqtt
MQTT_USERNAME=MinhTriDADN
MQTT_PASSWORD=
MQTT_FEED=MinhTriDADN/feeds
```

## Bảng tóm tắt các endpoint trong hệ thốn

#### Authentication
| Method | Endpoint       | Auth | 
|--------|----------------|------|
| POST   | /auth/login    | ❌   | 


#### Area
| Method | Endpoint  | Auth | 
|--------|-----------|------|
| GET    | /area     | ✅   |
| POST   | /area     | ✅   |
| PUT    | /area/:id | ✅   |
| DELETE | /area/:id | ✅   |


#### Sensor
| Method | Endpoint                                      | Auth | 
|--------|----------------------------------------------|------|
| GET    | /sensor                                     | ✅   |
| GET    | /sensor/area/:area_id/latest                | ✅   | 
| GET    | /sensor/area/:area_id/history/:type         | ✅   |
| POST   | /sensor                                     | ✅   | 
| PUT    | /sensor/:id                                 | ✅   |
| DELETE | /sensor/:id                                 | ✅   |
| POST | /sensor/data                                 | ✅   |

#### Device
| Method | Endpoint              | Auth | 
|--------|----------------------|------|
| GET    | /device              | ✅   | 
| POST   | /device/override     | ✅   |
| POST   | /device              | ✅   |
| PUT    | /device/:id          | ✅   | 
| DELETE | /device/:id          | ✅   | 


#### Threshold
| Method | Endpoint     | Auth | 
|--------|--------------|------|
| POST   | /threshold   | ✅   | 
| GET   |/threshold/:area_id| ✅   | 

#### Notification
| Method | Endpoint        | Auth |
|--------|----------------|------|
| GET    | /notification  | ✅   | 
| POST    |/notification/:id/read| ✅   | 

#### User
| Method | Endpoint         | Auth | 
|--------|------------------|------|
| GET    | /user            | ✅   | 
| GET    | /user/profile    | ✅   | 

## API Document (Endpoints)
Hệ thống Backend cung cấp tài liệu API tương tác thông qua Swagger UI, giúp developer dễ dàng kiểm thử và tích hợp.

### Truy cập Swagger UI
Sau khi khởi chạy server, truy cập tại:
```bash
http://localhost:3000/api
```
Swagger UI cung cấp:
- Danh sách đầy đủ các endpoint
- Mô tả request/response
- Test API trực tiếp trên trình duyệt

### Quy định chung
Base URL: http://localhost:3000

Xác thực: Tất cả các API (ngoại trừ Đăng nhập) yêu cầu gắn Token vào Header:
```
Authorization: Bearer <JWT_TOKEN>
```


### Xác thực (Authentication)
Endpoint: ```POST /auth/login```

Nhận vào (Body JSON):
```json
{
  "username": "admin",
  "password": "123"
}
```
Trả về (Success 200):
```json
{
    "message": "Đăng nhập thành công",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NzM2NjQ4NiwiZXhwIjoxNzc3NDUyODg2fQ.M5cnrplOK_VxXwYChiXKYU77RGbPhrZKn_W4SIbfxj4",
    "user": {
        "id": 1,
        "role": "admin",
        "username": "admin"
    }
}
```

### Khu vực (Area)
#### Lấy tất cả các khu vực trong nhà kính
Endpoint: ```GET /area```
Nhận vào: Header Token.
Trả về (Success 200): Danh sách khu vực mà người dùng có quyền xem.
```json
[
  {
    "id": 1,
    "name": "Nhà Kính A - Cà Chua",
    "description": "Khu vực trồng cà chua công nghệ cao"
  }
]
```
#### Thêm khu vực
Endpoint: ```POST area/``

Nhận vào (Body JSON):
```json
{
  "name": "Nhà màng 02",
  "description": "Khu vực nuôi cấy mô",
  "owner_id": 2
}
```
Trả về (Success 200): 
```json
{
  "message": "Tạo khu vực thành công",
  "area_id": 2
}
```
#### Chỉnh sửa khu vực
Endpoint: ```PUT area/:id```

Mô tả: Cập nhật, chỉnh sửa thông tin khu vực

Nhận vào (Body JSON):
```json
{
  "name": "Nhà màng 02 - Cập nhật",
  "description": "Đã chuyển sang trồng dâu tây"
}
```
Trả về (Success 200): 
```json
{
  "message": "Cập nhật khu vực thành công"
}
```
#### Xóa khu vực
Endpoint: ```DELETE area/:id```

Mô tả: Xóa khu vực

Trả về (Success 200): 
```json
{
  "message": "Xóa khu vực thành công"
}
```


### Cảm biến (Sensor)
#### Lấy tất cả các cảm biến trong hệ thống
Endpoint: ```GET /sensor/```

Mô tả: Trả về danh sách toàn bộ các cảm biến hiện có trong hệ thống cùng với thông tin khu vực tương ứng.

Trả về (Success 200):
```json
[
    {
        "id": 10,
        "sensor_name": "Cảm biến Độ ẩm đất B1",
        "type": "soil_moisture",
        "area_id": 2,
        "area_name": "Nhà Kính B - Dưa Lưới"
    },
    {
        "id": 9,
        "sensor_name": "Cảm biến Nhiệt độ/Độ ẩm B1",
        "type": "temp",
        "area_id": 2,
        "area_name": "Nhà Kính B - Dưa Lưới"
    }
]
```

#### Lấy dữ liệu mới nhất theo Khu vực
Endpoint: ```GET /sensor/area/:area_id/latest```

Mô tả: Lấy thông số mới nhất của tất cả cảm biến trong một khu vực (Nhiệt độ, Độ ẩm, Ánh sáng).

Trả về (Success 200):
```json
[
  {
    "sensor_id": 1,
    "sensor_name": "Cảm biến Nhiệt độ A1",
    "type": "temp",
    "value": 26.5,
    "time": "2026-04-28T15:00:00.000Z"
  }
]
```

#### Lấy lịch sử dữ liệu theo Loại cảm biến
Endpoint: ```GET /sensor/area/:area_id/history/:type```

Tham số ```:type: temp, moisture, soil_moisture, light.``` 

Trả về (Success 200): Mảng dữ liệu lịch sử để vẽ biểu đồ.
```json
[
  { "value": 26.5, "time": "2026-04-28T15:00:00Z" },
  { "value": 26.2, "time": "2026-04-28T14:50:00Z" }
]
```

#### Thêm mới một cảm biến
Endpoint: ```POST /sensor```

Mô tả: Đăng ký một thiết bị cảm biến mới vào danh mục quản lý của khu vực.

Nhận vào (Body JSON):
```json
{
  "name": "Cảm biến Ánh sáng A1",
  "type": "light",
  "area_id": 1
}
```
Trả về (Success 200):
```json
{
  "message": "Thêm cảm biến thành công"
}
```

#### Cập nhật thông tin cảm biến
Endpoint: ```PUT /sensor/:id```

Nhận vào (Body JSON):
```json
{
  "name": "Cảm biến Nhiệt độ A1",
  "type": "temp",
  "area_id": 1
}
```
Trả về (Success 200):
```json
{
  "message": "Cập nhật cảm biến thành công"
}
```

#### Xóa cảm biến
Endpoint: ```DELETE /sensor/:id```

Trả về (Success 200):
```json
{
  "message": "Xóa cảm biến thành công"
}
```

#### Thêm dữ liệu cảm biến
Endpoint: `POST /sensor/data`

Mô tả: Thêm giá trị đo đạc mới của một cảm biến cụ thể vào cơ sở dữ liệu.

Nhận vào (Body JSON):
```json
{
  "sensor_id": 1,
  "value": 26.5
}
```
Trả về (Success 200):
```json
{
  "message": "Thêm dữ liệu thành công"
}
```

### Thiết bị (Device)
#### Lấy danh sách tất cả các thiết bị trong hệ thống

Endpoint: ```GET /device```

Mô tả: Lấy danh sách thiết bị và trạng thái ON/OFF hiện tại.

Trả về (Success 200):
```json
[
  {
    "id": 1,
    "device_name": "Máy Bơm Khu A",
    "type": "pump",
    "status": 1,
    "area_name": "Nhà Kính A",
    "mode": "ON",
    "last_updated": "2026-04-28T15:10:00Z"
  }
]
```
#### Điều khiển thiết bị thủ công
Endpoint: ```POST /device/override```

Mô tả: Điều khiển thiết bị thủ công (Ghi đè chế độ tự động).

Nhận vào (Body JSON):
```json
{
  "device_id": 1,
  "mode": "ON",
  "expire_time": "2026-04-28T18:00:00Z"
}
```
Trả về (Success 200):
```json
{ "message": "Gửi lệnh điều khiển thành công" }
```
#### Thêm thiết bị mới
Endpoint: ```POST /device```

Nhận vào (Body JSON):
```json
{
  "name": "Hệ thống tưới nhỏ giọt",
  "type": "pump",
  "area_id": 5,
  "status": 1
}
```
Trả về (Success 200):
```json
{
  "message": "Thêm thiết bị thành công"
}
```
#### Cập nhật thông tin thiết bị
Endpoint: ```PUT device/:id```
Nhận vào (Body JSON):
```json
{
  "name": "Bơm tăng áp v2",
  "type": "pump",
  "status": 0,
  "area_id": 4
}
```
Trả về (Success 200):
```json
{
  "message": "Cập nhật thiết bị thành công"
}
```

#### Xóa thiết bị
Endpoint: ```DELETE device/:id```

Trả về (Success 200):
```json
{
  "message": "Xóa thiết bị thành công"
}
```



### Activity Log của thiết bị
Endpoint: ```GET /activity```

Phân quyền: Admin (thấy tất cả) hoặc Owner (chỉ thấy thiết bị trong khu vực của mình)

Trả về (Success 200): Lấy lịch sử hoạt động của thiết bị
```json
[
  {
    "id": 25,
    "device_id": 2,
    "device_name": "Đèn LED RGB Khu A",
    "device_type": "light",
    "mode": "ON",
    "source": "manual",
    "time": "2026-04-29T15:23:58.100Z",
    "area_name": "Nhà Kính A - Cà Chua"
  }
]
```
Endpoint: ```GET /activity/:device_id```

Trả về (Success 200): Lấy lịch sử theo 1 thiết bị cụ thể

```json
[
    {
        "id": 23,
        "mode": "ON",
        "source": "manual",
        "time": "2026-04-29T15:22:56.986Z"
    },
    {
        "id": 22,
        "mode": "OFF",
        "source": "manual",
        "time": "2026-04-29T15:22:56.160Z"
    }
]
```


### Cấu hình Ngưỡng (Threshold)
Endpoint: ```POST /threshold```

Mô tả: Thiết lập ngưỡng an toàn cho từng loại cảm biến theo khu vực.

Nhận vào (Body JSON):
```json
{
  "area_id": 1,
  "sensor_type": "temp",
  "min_value": 20,
  "max_value": 30
}
```
Trả về (403 Forbidden):
```json
{
    "message": "Chỉ quản trị viên mới có quyền này"
}
```
Trả về (Success 200):
```json
{ "message": "Thiết lập ngưỡng thành công" }
```

Endpoint: `GET /threshold/:area_id`

Mô tả: Trả về danh sách cấu hình các ngưỡng môi trường (tối thiểu, tối đa) cho từng loại cảm biến thuộc một khu vực cụ thể. 
Phân quyền: Quản trị viên (Admin) xem được tất cả, Chủ vườn (Owner) chỉ xem được khu vực mà mình quản lý.

Trả về (Success 200):
```json
[
  {
    "sensor_type": "temp",
    "min_value": 20,
    "max_value": 35
  },
  {
    "sensor_type": "soil_moisture",
    "min_value": 40,
    "max_value": 80
  }
]
```

### Thông báo (Notification)
Endpoint: ```GET /notification```

Mô tả: Lấy các cảnh báo khi thông số môi trường vượt ngưỡng.   

Trả về (Success 200):
```json
[
  {
    "id": 10,
    "title": "Cảnh báo Nhiệt độ",
    "message": "Nhiệt độ hiện tại (33°C) vượt ngưỡng cho phép",
    "type": "WARNING",
    "created_at": "2026-04-28T15:20:00Z"
    "is_read": true
  }
]
```

Endpoint: `POST /notification/:id/read`

Mô tả: Cập nhật trạng thái của thông báo thành đã đọc (is_read = 1) dựa trên ID thông báo và tài khoản người dùng đang đăng nhập.

Nhận vào: Tham số `:id` của thông báo trên URL.

Trả về (Success 200):
```json
{
  "message": "Đã đánh dấu thông báo là đã đọc"
}
```


### Quản lý người dùng

Endpoint: ```GET /user```

Mục đích: Cho phép Admin xem danh sách toàn bộ tài khoản để quản lý nhân sự trong nông trại.

Dữ liệu trả về (JSON):
``` json
[
    {
        "id": 1,
        "username": "admin",
        "name": "Nguyễn Văn A",
        "email": "admin@greenargric.com",
        "phone": "0901234567",
        "role": "admin"
    },
    {
        "id": 2,
        "username": "owner",
        "name": "Lê Văn B",
        "email": "owner@gmail.com",
        "phone": "0912345678",
        "role": "owner"
    }
]
```

Endpoint: ```GET /user/profile```

Mục đích: Lấy thông tin của chính người đang đăng nhập để hiển thị trên trang cá nhân.

Cơ chế: Backend tự động nhận diện ```user_id``` từ mã JWT gửi kèm trong Header, đảm bảo tính bảo mật và riêng tư.

Dữ liệu trả về (JSON):
```json
{
    "id": 1,
    "username": "admin",
    "name": "Nguyễn Văn A",
    "email": "admin@greenargric.com",
    "phone": "0901234567",
    "role": "admin"
}
```

Endpoint: `PUT /user/profile`

Mục đích: Cho phép người dùng đang đăng nhập tự cập nhật thông tin cá nhân (Tên, Email, Số điện thoại). 

Nhận vào (Body JSON - Có thể gửi 1 hoặc nhiều trường):
```json
{
  "name": "Nguyễn Văn A (Cập nhật)",
  "phone": "0988123456"
}
```

Trả về (Success: 200):
```json
{
    "message": "Cập nhật thông tin cá nhân thành công"
}
``` 

Endpoint: ```POST /user```

Mục đích: Thêm người dùng

Nhận vào (Body JSON):
```json
{
  "username": "chuvuon1",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "role": "owner",
  "email": "nva@gmail.com",
  "phone": "0987654321"
}
```
Trả về (Success: 200):
```json
{ "message": "Tạo người dùng thành công" }
``` 

Endpoint: ```PUT /user/:id```

Mục đích: ADmin chỉnh sửa thông tin người dùng

Nhận vào (Body JSON):
```json
{
  "name": "Nguyễn Văn A (Đã sửa)",
  "phone": "0111222333"
}
```
Trả về (Success: 200):
```json
{ "message": "Cập nhật người dùng thành công" }
``` 

Endpoint: ```DELETE /user/:id```

Mục đích: Xóa người dùng

Trả về (Success: 200):
```json
{ "message": "Xóa người dùng thành công" }
``` 


## Luồng xử lý tự động hóa (Auto Control Engine)
File mqtt.js chạy ngầm như một Background Worker thực hiện các công việc:
1. Lắng nghe dữ liệu đổ về từ các topic ```V1, V2, V3, V4.```
2. Lưu vết (Insert) vào cơ sở dữ liệu ```SensorData```.
3. So sánh giá trị với bảng ```ThresholdConfig``` của khu vực tương ứng.  
4. Cảnh báo: Nếu vượt ngưỡng, tạo dòng dữ liệu vào Notification.  
5. Điều khiển tự động: Nếu độ ẩm đất thấp, tự động Publish giá trị 1 xuống Topic của ```Máy bơm (V14)``` để bật nước, đồng thời ghi nhận vào bảng ```ActivityLog```

## Luồng hoạt động
```
[Phần cứng IoT] ---> (MQTT Broker) ---> [Node.js Backend] ---> (SQL Server)
       ^                                      |                      |
       |                                      v                      v
       +------------- (MQTT Broker) <---- [Kiểm tra Ngưỡng] <---- (Dashboard Frontend)
```

