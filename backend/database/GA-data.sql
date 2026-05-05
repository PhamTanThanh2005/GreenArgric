-- =====================================================================
SET IDENTITY_INSERT [User] ON;

INSERT INTO [User] (id, username, password, name, email, phone, role) VALUES
(1, N'admin', N'123', N'Nguyễn Văn A', N'admin@gmail.com', N'0901234567', N'admin'),
(2, N'owner', N'123', N'Phạm Ngọc Châu Trân', N'owner@gmail.com', N'0988123456', N'owner'),
(3, N'admin_minh', N'hashed_pwd_123', N'Phạm Ngọc Minh', N'minh_admin@gmail.com', N'0901234567', N'admin'),
(4, N'owner_khang', N'hashed_pwd_456', N'Trần Ngọc Khang', N'khang_owner@gmai.com', N'0912345678', N'owner'),
(5, N'phamtanthanh', N'123', N'Phạm Tấn Thành', N'thanhpham@gmail.com', N'0357130653', N'admin'),
(6, N'tranthitram', N'123456', N'Nguyễn Thị Trâm', N'tranthitram@gmail.com', N'03571112644', N'owner'),

SET IDENTITY_INSERT [User] OFF;

-- =====================================================================
SET IDENTITY_INSERT Area ON;

INSERT INTO Area (id, name, description) VALUES
(1, N'Nhà Kính A - Cà Chua', N'Khu vực trồng cà chua công nghệ cao, cần duy trì độ ẩm ổn định.'),
(2, N'Nhà Kính B - Dưa Lưới', N'Khu vực trồng dưa lưới, yêu cầu cường độ ánh sáng lớn.'),
(3, N'Khu thực nghiệm IoT', N'Khu vực kiểm thử các cảm biến MQTT và thiết bị điều khiển tự động.'), -- Dữ liệu bổ sung
(4, N'Vườn ươm hạt giống', N'Không gian ươm mầm với nhiệt độ được kiểm soát nghiêm ngặt.'), -- Dữ liệu bổ sung
(5, N'Nhà màng 02', N'Khu vực nuôi cấy mô'),
(6, N'Khu Dâu Tây', N'Đây là khu vực nuôi trồng cây dâu tây'),
(7, N'Khu trồng cây ăn quả', N'Khu trồng cây ăn quả'),
(8, N'Cây lúa nước', N'Khu vực trồng cây lúa nước.');

SET IDENTITY_INSERT Area OFF;
-- =====================================================================
INSERT INTO User_Area (user_id, area_id, access_level) VALUES
(2, 1, N'OWNER'),
(2, 2, N'OWNER'),
(2, 5, N'OWNER'),
(2, 6, N'OWNER'),
(2, 8, N'OWNER'),
(4, 7, N'OWNER'),
-- =====================================================================
SET IDENTITY_INSERT Device ON;

INSERT INTO Device (id, name, type, status, area_id, feed_key) VALUES
(1, N'Máy Bơm Chìm Khu A', N'pump', 1, 1, N'V10'),
(2, N'Đèn chiếu sáng Khu A', N'light', 1, 1, N'V11'),
(3, N'Máy Bơm Khu B', N'pump', 1, 2, N'A1'),
(4, N'Đèn LED', N'light', 1, 2, N'A2'),
(7, N'Máy Bơm Nước', N'pump', 1, 2, N'A3'),
(8, N'Đèn Quang Hợp Khu B', N'light', 1, 2, N'A4'),
(11, N'Máy bơm', N'pump', 1, 6, N'A5'),
(12, N'Đèn LED', N'light', 1, 6, N'A6'),
(13, N'Máy bơm nước', N'pump', 1, 5, N'A7'),
(14, N'Đèn LED', N'light', 0, 5, N'A8'),
(15, N'Đèn chiếu sáng', N'light', 1, 5, N'A9'),
(16, N'Máy bơm loại 1', N'pump', 1, 7, N'A10'),
(17, N'Đèn LED 4 màu', N'light', 1, 7, N'A11');

SET IDENTITY_INSERT Device OFF;

-- =====================================================================
SET IDENTITY_INSERT Sensor ON;

INSERT INTO Sensor (id, name, type, area_id, feed_key) VALUES
(1, N'Cảm biến Nhiệt độ A1', N'temp', 1, N'V1'),
(2, N'Cảm biến Độ ẩm đất A1', N'soil_moisture', 1, N'V2'),
(3, N'Cảm biến Độ ẩm KK A1', N'moisture', 1, N'V3'),
(4, N'Cảm biến Ánh sáng A1', N'light', 1, N'V4'),

(5, N'Cảm biến Nhiệt độ Khu B', N'temp', 2, N'B1'),
(6, N'Cảm biến Độ ẩm đất Khu B', N'soil_moisture', 2, N'B2'),
(7, N'Cảm biến Ánh sáng Khu B', N'light', 2, N'B3'),
(8, N'Cảm biến Độ ẩm KK Khu B', N'moisture', 2, N'B4'),

(9, N'Cảm biến Nhiệt độ Nhà màng 02', N'temp', 5, N'B5'),
(10, N'Cảm biến Độ ẩm đất Nhà màng 02', N'soil_moisture', 5, N'B6'),
(11, N'Cảm biến Nhiệt độ Khu Dâu Tây', N'temp', 6, N'B7'),
(12, N'Cảm biến Ánh sáng Khu Dâu Tây', N'light', 6, N'B8'),
(13, N'Cảm biến Nhiệt độ Cây ăn quả', N'temp', 7, N'B9'),
(14, N'Cảm biến Độ ẩm đất Cây ăn quả', N'soil_moisture', 7, N'B10');

SET IDENTITY_INSERT Sensor OFF;
-- =====================================================================
SET IDENTITY_INSERT ThresholdConfig ON;

INSERT INTO ThresholdConfig (id, area_id, sensor_type, min_value, max_value) VALUES
(1, 1, N'temp', 20, 30),
(2, 1, N'soil_moisture', 50, 75),
(3, 1, N'light', 60, 90),
(4, 2, N'temp', 20, 35),
(5, 2, N'soil_moisture', 75, 95),
(7, 2, N'light', 60, 90),
(8, 2, N'moisture', 65, 85),
(9, 1, N'moisture', 60, 90);

SET IDENTITY_INSERT ThresholdConfig OFF;

-- =====================================================================
SET IDENTITY_INSERT SensorData ON;

INSERT INTO SensorData (id, sensor_id, value, time) VALUES
(60, 4, 70, '2026-05-04 17:24:35.4033333'),
(61, 4, 15, '2026-05-04 17:28:52.5100000'),
(62, 4, 16, '2026-05-04 17:29:07.0600000'),
(63, 4, 99, '2026-05-04 17:35:58.5733333'),
(64, 4, 99, '2026-05-04 17:35:58.5733333'),
(65, 4, 16, '2026-05-04 17:36:26.3200000'),
(66, 1, 25, '2026-05-04 17:39:52.7033333'),
(67, 1, 21, '2026-05-04 17:40:08.6766667'),
(68, 1, 22, '2026-05-04 17:40:10.3700000'),
(69, 1, 25, '2026-05-04 17:40:16.0500000'),
(70, 1, 26, '2026-05-04 17:40:44.8566667'),
(71, 1, 35, '2026-05-04 17:44:50.9033333'),
(72, 1, 28, '2026-05-04 17:49:05.6833333'),
(73, 2, 70, '2026-05-04 17:54:52.4500000'),
(74, 2, 40, '2026-05-04 17:54:57.8866667'),
(75, 4, 80, '2026-05-04 17:57:13.2600000'),
(76, 4, 70, '2026-05-04 17:57:22.2933333'),
(77, 2, 80, '2026-05-04 17:58:25.1866667'),
(78, 2, 60, '2026-05-04 18:04:14.5600000');

SET IDENTITY_INSERT SensorData OFF;

-- =====================================================================
SET IDENTITY_INSERT ActivityLog ON;

INSERT INTO ActivityLog (id, device_id, mode, source, time) VALUES
(130, 1, N'OFF', N'manual', '2026-05-04 17:15:25.6800000'),
(131, 1, N'ON', N'manual', '2026-05-04 17:16:26.8466667'),
(132, 2, N'ON', N'auto', '2026-05-04 17:16:41.8533333'),
(133, 2, N'OFF', N'auto', '2026-05-04 17:35:58.9500000'),
(134, 2, N'OFF', N'auto', '2026-05-04 17:35:58.9500000'),
(135, 2, N'ON', N'auto', '2026-05-04 17:36:26.4466667'),
(136, 1, N'OFF', N'manual', '2026-05-04 17:43:03.4900000'),
(137, 1, N'ON', N'auto', '2026-05-04 17:54:58.1200000'),
(138, 1, N'OFF', N'auto', '2026-05-04 17:58:25.3733333'),
(139, 1, N'ON', N'manual', '2026-05-04 18:49:32.0100000'),
(140, 1, N'OFF', N'manual', '2026-05-04 18:49:46.8800000');

SET IDENTITY_INSERT ActivityLog OFF;

-- =====================================================================
INSERT INTO ManualOverride (user_id, device_id, mode, expire_time, created_at) VALUES
(1, 1, N'ON', '2026-04-28 18:00:00.0000000', '2026-04-28 16:04:47.4000000'),
(2, 1, N'OFF', '2026-05-04 11:50:46.0000000', '2026-05-04 18:49:46.8566667'),
(2, 2, N'OFF', '2026-05-04 10:13:22.0000000', '2026-05-04 17:12:22.5533333'),
(2, 3, N'ON', '2026-05-04 01:20:06.0000000', '2026-05-04 14:20:06.3766667'),
(2, 4, N'ON', '2026-05-04 01:20:07.0000000', '2026-05-04 14:20:07.3666667'),
(2, 7, N'OFF', '2026-05-03 04:46:10.0000000', '2026-05-03 17:46:10.1566667'),
(2, 8, N'OFF', '2026-05-03 04:46:11.0000000', '2026-05-03 17:46:11.4466667');

-- =====================================================================
SET IDENTITY_INSERT Task ON;

INSERT INTO Task (id, title, description, scheduled_at, status, is_done, area_id, user_id) VALUES
(1, N'Kiểm tra nồng độ dinh dưỡng', N'Pha dung dịch thủy canh cho dưa lưới.', '2026-04-29 15:22:58.6800000', N'IN_PROGRESS', 0, 2, 2),
(2, N'Thu hoạch cà chua đợt 1', N'Chọn các trái đã chín đều 80%.', '2026-05-01 15:22:00.0000000', N'IN_PROGRESS', 0, 1, 2),
(3, N'Kiểm tra nồng độ dinh dưỡng', N'P', '2026-04-28 15:22:58.6930000', N'PENDING', 0, 2, 2),
(4, N'Thu hoạch cà chua đợt 1', N'Chọn các trái đã chín đều 80%.', '2026-05-01 15:22:00.0000000', N'IN_PROGRESS', 0, 1, 2),
(5, N'Thu hoạch cà chua đợt 5', N'Chọn các trái đã chín đều 90%', '2026-05-06 15:22:00.0000000', N'COMPLETED', 1, 2, 2),

(6, N'Bảo trì máy bơm định kỳ', N'Kiểm tra và vệ sinh máy bơm chìm tại Khu A.', '2026-05-10 08:00:00.0000000', N'PENDING', 0, 1, 1),
(7, N'Cập nhật firmware cảm biến', N'Nạp lại code cho ESP32 khu thực nghiệm.', '2026-05-05 09:30:00.0000000', N'COMPLETED', 1, 3, 5),
(8, N'Tỉa cành dâu tây', N'Cắt bỏ các lá già, sâu bệnh ở luống 1 và 2.', '2026-05-06 07:00:00.0000000', N'PENDING', 0, 6, 6), 
(9, N'Kiểm tra hệ thống tưới', N'Đảm bảo béc tưới cây ăn quả không bị nghẹt.', '2026-05-07 16:00:00.0000000', N'IN_PROGRESS', 0, 7, 4);

SET IDENTITY_INSERT Task OFF;

-- =====================================================================
SET IDENTITY_INSERT Notification ON;

INSERT INTO Notification (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 2, N'Cảnh báo Nhiệt độ Khu B', N'Nhiệt độ hiện tại (33.8°C) vượt mức cho phép (32.0°C).', N'WARNING', 1, '2026-04-28 15:22:58.6833333'),
(2, 2, N'Tự động tưới nước', N'Máy bơm Khu A đã bật do độ ẩm đất thấp (42.5%).', N'INFO', 1, '2026-04-28 15:21:58.6833333'),
(3, 2, N'Cảnh báo Nhiệt độ Khu B', N'Nhiệt độ hiện tại (33.8°C) vượt mức cho phép (32.0°C).', N'WARNING', 1, '2026-04-28 15:22:58.6933333'),
(4, 2, N'Tự động tưới nước', N'Máy bơm Khu A đã bật do độ ẩm đất thấp (42.5%).', N'INFO', 1, '2026-04-28 15:21:58.6933333'),
(5, 2, N'Cảnh báo khẩn: Cảm biến Nhiệt độ/Độ ẩm A1', N'Giá trị 31 đã vượt ngưỡng an toàn (20 - 30)', N'WARNING', 1, '2026-04-28 22:37:24.6400000'),
(6, 2, N'Cảnh báo khẩn: Cảm biến Nhiệt độ/Độ ẩm A1', N'Giá trị 31.5 đã vượt ngưỡng an toàn (20 - 30)', N'WARNING', 1, '2026-04-28 22:37:28.4400000'),
(7, 2, N'Cảnh báo khẩn: Cảm biến Nhiệt độ A1', N'Giá trị 32 đã vượt ngưỡng an toàn (20 - 30)', N'WARNING', 1, '2026-04-28 23:03:18.3433333'),
(8, 2, N'Cảnh báo khẩn: Cảm biến Nhiệt độ A1', N'Giá trị 33 đã vượt ngưỡng an toàn (20 - 30)', N'WARNING', 1, '2026-04-28 23:03:21.2300000'),
(9, 2, N'Cảnh báo khẩn: Cảm biến Nhiệt độ A1', N'Giá trị 33 đã vượt ngưỡng an toàn (20 - 30)', N'WARNING', 1, '2026-04-28 23:03:21.5500000'),

(10, 1, N'Khởi động hệ thống', N'Hệ thống server trung tâm đã được khởi động lại thành công.', N'INFO', 0, '2026-05-04 06:00:00.0000000'),
(11, 5, N'Mất kết nối MQTT', N'Cảm biến nhiệt độ khu thực nghiệm IoT không phản hồi tín hiệu trong 15 phút.', N'ERROR', 0, '2026-05-05 10:15:22.0000000'),
(12, 6, N'Cảnh báo Độ ẩm Dâu Tây', N'Độ ẩm đất hiện tại ở Khu Dâu Tây giảm xuống dưới mức 60%.', N'WARNING', 0, '2026-05-05 14:20:00.0000000'), 
(13, 4, N'Tự động bật đèn', N'Hệ thống tự động bật Đèn LED 4 màu ở Khu trồng cây ăn quả.', N'INFO', 1, '2026-05-04 18:00:00.0000000'), 

SET IDENTITY_INSERT Notification OFF;