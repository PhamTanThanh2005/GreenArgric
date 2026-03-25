# GREEN ARGRIC PROJECT
## Folder constructure
my-react-app/
├── public/                 # Các file tĩnh (favicon, index.html, robots.txt...)
├── src/                    # Chứa toàn bộ mã nguồn của ứng dụng
│   ├── assets/             # Hình ảnh, fonts, file CSS/SCSS dùng chung
│   ├── components/         # Các UI component dùng chung (Button, Modal, Input...)
│   ├── features/           # Phân chia theo từng chức năng lớn (đọc thêm bên dưới)
│   ├── hooks/              # Custom hooks dùng chung (useAuth, useDebounce...)
│   ├── layouts/            # Cấu trúc layout của trang (Header, Footer, Sidebar...)
│   ├── pages/ (hoặc views/)# Các component đại diện cho một trang (tương ứng với Route)
│   ├── routes/             # Cấu hình định tuyến (React Router)
│   ├── services/ (hoặc api/) # Các file gọi API, cấu hình Axios/Fetch
│   ├── store/ (hoặc context/)# Quản lý state toàn cục (Redux, Zustand, React Context)
│   ├── utils/ (hoặc helpers/)# Các hàm tiện ích dùng chung (formatDate, validate...)
│   ├── types/              # (Nếu dùng TypeScript) Chứa các interfaces, types dùng chung
│   ├── App.tsx             # Component gốc của ứng dụng
│   └── main.tsx            # File entry point (Render App vào DOM)
├── .env                    # Biến môi trường
├── .gitignore              # Cấu hình bỏ qua file khi push lên Git
├── package.json            # Thông tin dependencies và scripts của dự án
└── vite.config.ts          # Cấu hình bundler (Vite/Webpack)