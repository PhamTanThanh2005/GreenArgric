-- =====================================================================
-- 1. Thêm Người dùng (Users) - Chỉ gồm Admin và Owner
-- =====================================================================
INSERT INTO [User] (username, password, name, email, phone, role)
VALUES 
('admin', '123', N'Nguyễn Văn A', 'admin@greenargric.com', '0901234567', 'admin'),
('owner', '123', N'Lê Văn B', 'owner@gmail.com', '0912345678', 'owner');

-- =====================================================================
-- 2. Thêm Khu vực (Areas)
-- =====================================================================
INSERT INTO Area (name, description)
VALUES 
(N'Nhà Kính A - Cà Chua', N'Khu vực trồng cà chua công nghệ cao, cần duy trì độ ẩm ổn định.'),
(N'Nhà Kính B - Dưa Lưới', N'Khu vực trồng dưa lưới, yêu cầu cường độ ánh sáng lớn.');

-- =====================================================================
-- 3. Phân quyền Khu vực (User_Area)
-- =====================================================================
-- Owner Khang (user_id = 2) quản lý toàn quyền cả 2 khu vực
INSERT INTO User_Area (user_id, area_id, access_level)
VALUES 
(2, 1, 'OWNER'), 
(2, 2, 'OWNER');

-- =====================================================================
-- 4. Thêm Thiết bị (Devices)
-- =====================================================================
INSERT INTO Device (name, type, status, area_id)
VALUES 
(N'Máy Bơm Chìm Khu A', 'pump', 1, 1),
(N'Đèn LED RGB Khu A', 'light', 1, 1),
(N'Máy Bơm Chìm Khu B', 'pump', 1, 2),
(N'Đèn Quang Hợp Khu B', 'light', 1, 2);

-- =====================================================================
-- 5. Thêm Cảm biến (Sensors)
-- =====================================================================
INSERT INTO Sensor (name, type, area_id)
VALUES 
(N'Cảm biến Nhiệt độ/Độ ẩm A1', 'temp', 1),
(N'Cảm biến Độ ẩm đất A1', 'soil_moisture', 1),
(N'Cảm biến Ánh sáng A1', 'light', 1),
(N'Cảm biến Nhiệt độ/Độ ẩm B1', 'temp', 2),
(N'Cảm biến Độ ẩm đất B1', 'soil_moisture', 2);

-- =====================================================================
-- 6. Thiết lập Ngưỡng (ThresholdConfig)
-- =====================================================================
INSERT INTO ThresholdConfig (area_id, sensor_type, min_value, max_value)
VALUES 
-- Ngưỡng cho Cà chua (Khu A)
(1, 'temp', 20.0, 28.0),             
(1, 'soil_moisture', 50.0, 75.0),    
(1, 'light', 400.0, 1000.0),         
-- Ngưỡng cho Dưa lưới (Khu B)
(2, 'temp', 25.0, 32.0),             
(2, 'soil_moisture', 40.0, 60.0);    

-- =====================================================================
-- 7. Dữ liệu đo đạc cảm biến (SensorData) - Giả lập trạng thái vượt ngưỡng
-- =====================================================================
INSERT INTO SensorData (sensor_id, value, time)
VALUES 
(1, 26.5, DATEADD(MINUTE, -15, GETDATE())),
(2, 48.0, DATEADD(MINUTE, -10, GETDATE())), -- Độ ẩm đất Khu A (ngưỡng min 50)
(1, 27.2, DATEADD(MINUTE, -5, GETDATE())),
(2, 42.5, DATEADD(MINUTE, -1, GETDATE())),  -- Độ ẩm đất Khu A tiếp tục giảm
(4, 33.8, GETDATE());                       -- Nhiệt độ Khu B VƯỢT NGƯỠNG (Max 32)

-- =====================================================================
-- 8. Ghi nhận Hoạt động (ActivityLog)
-- =====================================================================
INSERT INTO ActivityLog (device_id, mode, source, time)
VALUES 
(1, 'ON', 'auto', DATEADD(MINUTE, -1, GETDATE())), -- Hệ thống tự bật bơm Khu A
(2, 'ON', 'manual', DATEADD(HOUR, -1, GETDATE())); -- Chủ vườn tự bật đèn

-- =====================================================================
-- 9. Ghi đè Thủ công (ManualOverride)
-- =====================================================================
-- Owner Khang (user_id = 2) duy trì bật đèn Khu A thủ công
INSERT INTO ManualOverride (user_id, device_id, mode, expire_time, created_at)
VALUES 
(2, 2, 'ON', DATEADD(HOUR, 3, GETDATE()), GETDATE());

-- =====================================================================
-- 10. Giao việc/Nhắc nhở (Task)
-- =====================================================================
INSERT INTO Task (title, description, scheduled_at, status, is_done, area_id, user_id)
VALUES 
(N'Kiểm tra nồng độ dinh dưỡng', N'Pha dung dịch thủy canh cho dưa lưới.', DATEADD(DAY, 1, GETDATE()), 'PENDING', 0, 2, 2),
(N'Thu hoạch cà chua đợt 1', N'Chọn các trái đã chín đều 80%.', DATEADD(DAY, 3, GETDATE()), 'PENDING', 0, 1, 2);

-- =====================================================================
-- 11. Cảnh báo hệ thống (Notification)
-- =====================================================================
INSERT INTO Notification (user_id, title, message, type, is_read, created_at)
VALUES 
(2, N'Cảnh báo Nhiệt độ Khu B', N'Nhiệt độ hiện tại (33.8°C) vượt mức cho phép (32.0°C).', 'WARNING', 0, GETDATE()),
(2, N'Tự động tưới nước', N'Máy bơm Khu A đã bật do độ ẩm đất thấp (42.5%).', 'INFO', 1, DATEADD(MINUTE, -1, GETDATE()));


-- =====================================================================
-- 1. Thêm Người dùng (Users) - Chỉ gồm Admin và Owner
-- =====================================================================
INSERT INTO [User] (username, password, name, email, phone, role)
VALUES 
('admin_minh', 'hashed_pwd_123', N'Đoàn Quốc Minh', 'minh.admin@greenargric.com', '0901234567', 'admin'),
('owner_khang', 'hashed_pwd_456', N'Lê Sỹ Hoàng Khang', 'khang.owner@gmail.com', '0912345678', 'owner');

-- =====================================================================
-- 2. Thêm Khu vực (Areas)
-- =====================================================================
INSERT INTO Area (name, description)
VALUES 
(N'Nhà Kính A - Cà Chua', N'Khu vực trồng cà chua công nghệ cao, cần duy trì độ ẩm ổn định.'),
(N'Nhà Kính B - Dưa Lưới', N'Khu vực trồng dưa lưới, yêu cầu cường độ ánh sáng lớn.');

-- =====================================================================
-- 3. Phân quyền Khu vực (User_Area)
-- =====================================================================
-- Owner Khang (user_id = 2) quản lý toàn quyền cả 2 khu vực
INSERT INTO User_Area (user_id, area_id, access_level)
VALUES 
(2, 1, 'OWNER'), 
(2, 2, 'OWNER');

-- =====================================================================
-- 4. Thêm Thiết bị (Devices)
-- =====================================================================
INSERT INTO Device (name, type, status, area_id)
VALUES 
(N'Máy Bơm Chìm Khu A', 'pump', 1, 1),
(N'Đèn LED RGB Khu A', 'light', 1, 1),
(N'Máy Bơm Chìm Khu B', 'pump', 1, 2),
(N'Đèn Quang Hợp Khu B', 'light', 1, 2);

-- =====================================================================
-- 5. Thêm Cảm biến (Sensors)
-- =====================================================================
INSERT INTO Sensor (name, type, area_id)
VALUES 
(N'Cảm biến Nhiệt độ/Độ ẩm A1', 'temp', 1),
(N'Cảm biến Độ ẩm đất A1', 'soil_moisture', 1),
(N'Cảm biến Ánh sáng A1', 'light', 1),
(N'Cảm biến Nhiệt độ/Độ ẩm B1', 'temp', 2),
(N'Cảm biến Độ ẩm đất B1', 'soil_moisture', 2);

-- =====================================================================
-- 6. Thiết lập Ngưỡng (ThresholdConfig)
-- =====================================================================
INSERT INTO ThresholdConfig (area_id, sensor_type, min_value, max_value)
VALUES 
-- Ngưỡng cho Cà chua (Khu A)
(1, 'temp', 20.0, 28.0),             
(1, 'soil_moisture', 50.0, 75.0),    
(1, 'light', 400.0, 1000.0),         
-- Ngưỡng cho Dưa lưới (Khu B)
(2, 'temp', 25.0, 32.0),             
(2, 'soil_moisture', 40.0, 60.0);    

-- =====================================================================
-- 7. Dữ liệu đo đạc cảm biến (SensorData) - Giả lập trạng thái vượt ngưỡng
-- =====================================================================
INSERT INTO SensorData (sensor_id, value, time)
VALUES 
(1, 26.5, DATEADD(MINUTE, -15, GETDATE())),
(2, 48.0, DATEADD(MINUTE, -10, GETDATE())), -- Độ ẩm đất Khu A (ngưỡng min 50)
(1, 27.2, DATEADD(MINUTE, -5, GETDATE())),
(2, 42.5, DATEADD(MINUTE, -1, GETDATE())),  -- Độ ẩm đất Khu A tiếp tục giảm
(4, 33.8, GETDATE());                       -- Nhiệt độ Khu B VƯỢT NGƯỠNG (Max 32)

-- =====================================================================
-- 8. Ghi nhận Hoạt động (ActivityLog)
-- =====================================================================
INSERT INTO ActivityLog (device_id, mode, source, time)
VALUES 
(1, 'ON', 'auto', DATEADD(MINUTE, -1, GETDATE())), -- Hệ thống tự bật bơm Khu A
(2, 'ON', 'manual', DATEADD(HOUR, -1, GETDATE())); -- Chủ vườn tự bật đèn

-- =====================================================================
-- 9. Ghi đè Thủ công (ManualOverride)
-- =====================================================================
-- Owner Khang (user_id = 2) duy trì bật đèn Khu A thủ công
INSERT INTO ManualOverride (user_id, device_id, mode, expire_time, created_at)
VALUES 
(2, 2, 'ON', DATEADD(HOUR, 3, GETDATE()), GETDATE());

-- =====================================================================
-- 10. Giao việc/Nhắc nhở (Task)
-- =====================================================================
INSERT INTO Task (title, description, scheduled_at, status, is_done, area_id, user_id)
VALUES 
(N'Kiểm tra nồng độ dinh dưỡng', N'Pha dung dịch thủy canh cho dưa lưới.', DATEADD(DAY, 1, GETDATE()), 'PENDING', 0, 2, 2),
(N'Thu hoạch cà chua đợt 1', N'Chọn các trái đã chín đều 80%.', DATEADD(DAY, 3, GETDATE()), 'PENDING', 0, 1, 2);

-- =====================================================================
-- 11. Cảnh báo hệ thống (Notification)
-- =====================================================================
INSERT INTO Notification (user_id, title, message, type, is_read, created_at)
VALUES 
(2, N'Cảnh báo Nhiệt độ Khu B', N'Nhiệt độ hiện tại (33.8°C) vượt mức cho phép (32.0°C).', 'WARNING', 0, GETDATE()),
(2, N'Tự động tưới nước', N'Máy bơm Khu A đã bật do độ ẩm đất thấp (42.5%).', 'INFO', 1, DATEADD(MINUTE, -1, GETDATE()));

