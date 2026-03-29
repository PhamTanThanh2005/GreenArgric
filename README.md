# BACKEND

## RUN
```
npm i
node index.js
```

## API
- /auth
    - POST: /login. 
        - Truyền vào body 
            ``` json
                {
                    "username": "owner1",
                    "password": "123"
                }
            ```
        - Trả về
            ```json
                {
                    "message": "Login thành công",
                    "user": {
                        "id": 1,
                        "name": "Nguyễn Văn A",
                        "role": "owner"
                    }
                }
            ```

- /sensor
    - GET: không có gì. Lấy cái mới nhất của từng type device
        - Trả về
            ``` json
            [
                {
                    "type": "soil_moisture",
                    "value": 20,
                    "time": "2026-03-25T23:25:21.953Z"
                },
                {
                    "type": "moisture",
                    "value": 40,
                    "time": "2026-03-25T23:25:21.953Z"
                }, ...
            ]
            ```
    - GET: /type/:type - Lấy tất cả data theo type 
        - Trả về
            ```json
            [
                {
                    "value": 27,
                    "time": "2026-03-29T09:57:47.886Z"
                }, ...
            ]
            ```
    - POST: không có gì - Để test truyền dữ liệu vào sensor cụ thể. Truyền vào body
        - Trả về
            ``` json
            {
                "sensor_id": 2,
                "value": 1000
            }
            ```

- /threshold
    - POST: Không có gì
        - Truyền vào header
            ```json
            {
                "role": "admin",
                "user_id": 2
            }
            ```
        - Truyền vào body
            ```json
                {
                "device_id": 2,
                "sensor_type": "temp",
                "min_value": 20,
                "max_value": 100
                }
            ```
        - Trả về 
            ```json
                message: "Inserted + processed successfully"
            ```

- /reminder
    - GET: Không có gì
        - Truyền vào header
            ```json
            {
                "role": "owner",
                "user_id": 1
            }
            - Trả về
        - Trả về
            ```json
                [
                    {
                        "id": 878,
                        "description": "Sensor soil_moisture dưới ngưỡng (30) -> pump ON",
                        "time": "2026-03-29T14:02:51.160Z"
                    }, ...
                ]
            ```
    - POST: /:id - Để đánh dấu là đã đọc và không hiện thị nữa
        - Truyền vào header
            ```json
            {
                "role": "owner",
                "user_id": 1
            }
            ```
        - Trả về
            ```json
                {
                    "message": "Reminder marked as done"
                }
            ```

- /device
    - GET: Không có gì
        - Truyền vào header
            ```json
                {
                    "role": "owner",
                    "user_id": 1
                }
            ```
        - Trả về
            ```json
                [
                    {
                        "id": 1,
                        "type": "pump"
                    },
                    {
                        "id": 2,
                        "type": "light"
                    }
                ]
            ```
    - POST: /override - Người dùng bật tắt thủ công
        - Truyền vào header 
            ```json
                {
                    "role": "owner",
                    "user_id": 1
                }
            ```
        - Truyền vào body
            ```json
                {
                    "device_id": 1,
                    "mode": "OFF",
                    "expire_time": "2026-03-29T13:50:00"
                }
            ```
        - Trả về 
            ```json
                {
                    "message": "Manual override created"
                }
            ```

=> Lỗi thì trả về "error": "..."

=> Thành công thì trả về "message": "..." 

## CHECK THRESHOLD 
### PUMP
- ON: 
    - SM < SM_config_min
    - (SM < SM_config_min + 10 AND temp > temp_config_max)
    - (SM < SM_config_min + 10 AND RH > RH_config_max) 
- OFF
    - SM > SM_config_max
### LIGHT
- ON:
    - LUX < LUX_config_min
- OFF
    - LUX > LUX_config_max 


