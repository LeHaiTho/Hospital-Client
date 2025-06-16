# Hospital Management System - Client

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)

Ứng dụng web client cho Hệ thống Quản lý Bệnh viện - một nền tảng toàn diện để quản lý các hoạt động bệnh viện, bao gồm quản lý bác sĩ, bệnh nhân, lịch hẹn và các chức năng y tế khác.

## 🚀 Tính năng chính

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 hoặc **yarn**: >= 1.22.0
- **Browser**: Chrome, Firefox, Safari, Edge (phiên bản mới nhất)

## 🚀 Cài đặt và Chạy

### 1. Clone Repository

```bash
git clone https://github.com/LeHaiTho/Hospital-Client.git
cd Hospital-Client
```

### 2. Cài đặt Dependencies

```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### 4. Chạy Development Server

```bash
# Sử dụng npm
npm run dev

# Hoặc sử dụng yarn
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 5. Build cho Production

```bash
# Build ứng dụng
npm run build

# Preview build
npm run preview
```

## 📁 Cấu trúc Thư mục

```
client/
├── public/                     # Static assets
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── apis/                   # API services
│   │   ├── axiosConfig.js
│   │   ├── appointmentApi.js
│   │   ├── authApi.js
│   │   └── ...
│   ├── assets/                 # Assets (images, fonts)
│   │   ├── fonts/
│   │   └── images/
│   ├── features/               # Feature modules
│   │   ├── category/
│   │   ├── doctor/
│   │   ├── hospital/
│   │   └── user/
│   ├── pages/                  # Page components
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── doctor/
│   │   ├── hospitalManager/
│   │   └── staff/
│   ├── redux/                  # Redux store
│   │   ├── slices/
│   │   └── store.js
│   ├── router/                 # Routing configuration
│   │   └── AppRouter.jsx
│   ├── utils/                  # Utilities
│   │   ├── components/
│   │   ├── layout/
│   │   └── helpers/
│   ├── App.jsx                 # Main App component
│   └── main.jsx               # Entry point
├── .eslintrc.cjs              # ESLint configuration
├── package.json               # Dependencies và scripts
├── vite.config.js            # Vite configuration
└── README.md                 # Documentation
```

## 🎯 Scripts có sẵn

```bash
# Development
npm run dev          # Chạy development server

# Production
npm run build        # Build cho production
npm run preview      # Preview production build

