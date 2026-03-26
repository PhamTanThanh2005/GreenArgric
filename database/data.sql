INSERT INTO [User](name, username, password, role) VALUES
(N'Nguyễn Văn A', 'owner1', '123', 'owner'),
(N'Trần Văn B', 'admin1', '123', 'admin');

INSERT INTO Device(type, user_id) VALUES
('pump', 1),
('light', 1);

INSERT INTO Sensor(type) VALUES
('temp'),
('light'),
('moisture'),
('soil_moisture');

-- temp dùng cho cả pump và light
INSERT INTO SensorDevice VALUES (1, 1);
INSERT INTO SensorDevice VALUES (1, 2);
-- light sensor cho light
INSERT INTO SensorDevice VALUES (2, 2);
-- moisture cho pump
INSERT INTO SensorDevice VALUES (3, 1);
-- soil moisture cho pump
INSERT INTO SensorDevice VALUES (4, 1);

INSERT INTO SensorData(sensor_id, value) VALUES
(1, 35.0),  -- temp cao
(1, 28.5),
(2, 800),   -- ánh sáng mạnh
(3, 40),    -- độ ẩm thấp
(4, 20);    -- đất khô

INSERT INTO ThresholdConfig(device_id, sensor_type, min_value, max_value) VALUES
(1, 'temp', 20, 30),             -- pump theo nhiệt độ
(1, 'soil_moisture', 30, 70),    -- pump theo đất
(2, 'light', 200, 700);          -- light theo ánh sáng

INSERT INTO ActivityLog(device_id, mode, source) VALUES
(1, 'ON', 'auto'),
(1, 'OFF', 'manual'),
(2, 'ON', 'auto');

INSERT INTO Reminder(user_id, description, time) VALUES
(1, N'Nhiệt độ vượt ngưỡng, bật máy bơm', GETDATE()),
(1, N'Độ ẩm đất thấp, cần tưới', GETDATE());