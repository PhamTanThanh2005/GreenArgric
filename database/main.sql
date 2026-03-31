CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(10) NOT NULL,

    CONSTRAINT chk_role 
    CHECK (role IN ('owner', 'admin'))
);

CREATE TABLE Device (
    id INT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(10) NOT NULL,
    user_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES [User](id),

    CONSTRAINT chk_device_type 
    CHECK (type IN ('pump', 'light'))
);

CREATE TABLE Sensor (
    id INT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(20) NOT NULL,

    CONSTRAINT chk_sensor_type 
    CHECK (type IN ('temp', 'light', 'moisture', 'soil_moisture'))
);

CREATE TABLE SensorDevice (
    sensor_id INT NOT NULL,
    device_id INT NOT NULL,

    PRIMARY KEY (sensor_id, device_id),

    FOREIGN KEY (sensor_id) REFERENCES Sensor(id),
    FOREIGN KEY (device_id) REFERENCES Device(id)
);

CREATE TABLE SensorData (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sensor_id INT NOT NULL,
    value FLOAT NOT NULL,
    time DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id)
);

CREATE TABLE ThresholdConfig (
    id INT IDENTITY(1,1) PRIMARY KEY,
    device_id INT NOT NULL,
    sensor_type NVARCHAR(20) NOT NULL,
    min_value FLOAT,
    max_value FLOAT,

    FOREIGN KEY (device_id) REFERENCES Device(id),

    CONSTRAINT chk_sensor_type 
    CHECK (sensor_type IN ('temp', 'light', 'moisture', 'soil_moisture')),

    CONSTRAINT uq_device_sensor UNIQUE (device_id, sensor_type)
);

CREATE TABLE ActivityLog (
    id INT IDENTITY(1,1) PRIMARY KEY,
    device_id INT NOT NULL,
    mode NVARCHAR(3) NOT NULL,
    source NVARCHAR(10) NOT NULL,
    time DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (device_id) REFERENCES Device(id),

    CONSTRAINT chk_mode 
    CHECK (mode IN ('ON', 'OFF')),

    CONSTRAINT chk_source 
    CHECK (source IN ('auto', 'manual'))
);

CREATE TABLE Reminder (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    description NVARCHAR(255),
    time DATETIME2 NOT NULL,
    is_done BIT DEFAULT 0, 

    FOREIGN KEY (user_id) REFERENCES [User](id)
);

CREATE TABLE ManualOverride (
    id INT IDENTITY(1,1) PRIMARY KEY,
    device_id INT,
    mode NVARCHAR(10), -- ON / OFF
    expire_time DATETIME,
    created_at DATETIME DEFAULT GETDATE()
)