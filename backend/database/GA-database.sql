-- 1. Bảng User
CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100),
    phone NVARCHAR(20),
    role NVARCHAR(20) NOT NULL,
    
    CONSTRAINT chk_user_role CHECK (role IN ('admin', 'owner', 'staff'))
);

-- 2. Bảng Area
CREATE TABLE Area (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255)
);

-- 3. Bảng User_Area (Bảng trung gian N:M phân quyền quản lý khu vực)
CREATE TABLE User_Area (
    user_id INT NOT NULL,
    area_id INT NOT NULL,
    access_level NVARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    
    PRIMARY KEY (user_id, area_id),
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES Area(id) ON DELETE CASCADE,
    CONSTRAINT chk_access_level CHECK (access_level IN ('OWNER', 'EDITOR', 'VIEWER'))
);

-- 4. Bảng Device
CREATE TABLE Device (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(20) NOT NULL,
    status BIT DEFAULT 1, -- 1: Active, 0: Inactive
    area_id INT NOT NULL,
    feed_key NVARCHAR(20),
    
    FOREIGN KEY (area_id) REFERENCES Area(id) ON DELETE CASCADE,
    CONSTRAINT chk_device_type CHECK (type IN ('pump', 'light'))
);

-- 5. Bảng Sensor
CREATE TABLE Sensor (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(20) NOT NULL,
    area_id INT NOT NULL,
    feed_key NVARCHAR(20),
    
    FOREIGN KEY (area_id) REFERENCES Area(id) ON DELETE CASCADE,
    CONSTRAINT chk_sensor_type CHECK (type IN ('temp', 'light', 'moisture', 'soil_moisture'))
);

-- 6. Bảng ThresholdConfig
CREATE TABLE ThresholdConfig (
    id INT IDENTITY(1,1) PRIMARY KEY,
    area_id INT NOT NULL,
    sensor_type NVARCHAR(20) NOT NULL,
    min_value FLOAT,
    max_value FLOAT,
    
    FOREIGN KEY (area_id) REFERENCES Area(id) ON DELETE CASCADE,
    CONSTRAINT chk_threshold_type CHECK (sensor_type IN ('temp', 'light', 'moisture', 'soil_moisture')),
    CONSTRAINT uq_area_sensor_threshold UNIQUE (area_id, sensor_type) -- Đảm bảo 1 khu vực chỉ có 1 khoảng ngưỡng/loại cảm biến
);

-- 7. Bảng SensorData
CREATE TABLE SensorData (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sensor_id INT NOT NULL,
    value FLOAT NOT NULL,
    time DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id) ON DELETE CASCADE
);

-- 8. Bảng ActivityLog
CREATE TABLE ActivityLog (
    id INT IDENTITY(1,1) PRIMARY KEY,
    device_id INT NOT NULL,
    mode NVARCHAR(10) NOT NULL,
    source NVARCHAR(20) NOT NULL,
    time DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (device_id) REFERENCES Device(id) ON DELETE CASCADE,
    CONSTRAINT chk_activity_mode CHECK (mode IN ('ON', 'OFF')),
    CONSTRAINT chk_activity_source CHECK (source IN ('auto', 'manual'))
);

-- 9. Bảng ManualOverride
CREATE TABLE ManualOverride (
    user_id INT NOT NULL,
    device_id INT NOT NULL,
    mode NVARCHAR(10) NOT NULL,
    expire_time DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    PRIMARY KEY (user_id, device_id),
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE NO ACTION,
    FOREIGN KEY (device_id) REFERENCES Device(id) ON DELETE CASCADE,
    CONSTRAINT chk_override_mode CHECK (mode IN ('ON', 'OFF'))
);

-- 10. Bảng Task
CREATE TABLE Task (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    scheduled_at DATETIME2 NOT NULL,
    status NVARCHAR(20) DEFAULT 'PENDING',
    is_done BIT DEFAULT 0,
    area_id INT NOT NULL,
    user_id INT NOT NULL, -- Người tạo
    
    FOREIGN KEY (area_id) REFERENCES Area(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE NO ACTION,
    CONSTRAINT chk_task_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED'))
);

-- 11. Bảng Notification
CREATE TABLE Notification (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(100) NOT NULL,
    message NVARCHAR(500) NOT NULL,
    type NVARCHAR(20) DEFAULT 'INFO',
    is_read BIT DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE,
    CONSTRAINT chk_notification_type CHECK (type IN ('INFO', 'WARNING', 'ERROR'))
);