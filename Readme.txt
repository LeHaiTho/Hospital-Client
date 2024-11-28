src/
│
├── components/         # Các component dùng chung giữa các role
│   ├── Header.js
│   ├── Footer.js
│   ├── Sidebar.js
│   └── Loading.js
│
├── pages/              # Các trang của từng role
│   ├── admin/
│   │   ├── Dashboard.js
│   │   └── HospitalManagement.js
│   │
│   ├── manager/
│   │   ├── DoctorManagement.js
│   │   └── StaffManagement.js
│   │
│   ├── doctor/
│   │   ├── ScheduleManagement.js
│   │   └── PatientList.js
│   │
│   ├── staff/
│   │   └── AppointmentManagement.js
│
├── layouts/            # Layout riêng cho từng role
│   ├── AdminLayout.js
│   ├── ManagerLayout.js
│   ├── DoctorLayout.js
│   └── StaffLayout.js
│
├── routes/             # Cấu hình routing
│   ├── AuthRoutes.js   # Route cho các trang yêu cầu đăng nhập
│   ├── AppRoutes.js    # Route tổng quản lý các trang
│   └── MainRoutes.js   # Route chính cho ứng dụng (public và private route)
│
└── App.js              # Khởi tạo App với routing
{
    "doctorHospital": [
        {
            "id": 4,
            "doctor_id": 29,
            "hospital_id": 4,
            "is_active": true,
            "isDeleted": false,
            "createdAt": "2024-09-28T02:25:20.215Z",
            "updatedAt": "2024-09-28T02:25:20.215Z",
            "doctor": {
                "id": 29,
                "description": "asdsa",
                "user_id": 32,
                "user": {
                    "id": 32,
                    "fullname": "assadsa",
                    "email": "lethdo11112002@gmail.com",
                    "phone": "4232423"
                },
                "doctorSpecialty": [
                    {
                        "id": 25,
                        "hospital_specialty_id": 14,
                        "hospitalSpecialty": {
                            "specialty_id": 50,
                            "specialty": {
                                "id": 50,
                                "name": "Cơ Xương Khớp"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": 5,
            "doctor_id": 30,
            "hospital_id": 4,
            "is_active": true,
            "isDeleted": false,
            "createdAt": "2024-09-28T02:25:42.361Z",
            "updatedAt": "2024-09-28T02:25:42.361Z",
            "doctor": {
                "id": 30,
                "description": "sasdassadas",
                "user_id": 33,
                "user": {
                    "id": 33,
                    "fullname": "sadas",
                    "email": "dadsdasdas@gmail.com",
                    "phone": "4232423"
                },
                "doctorSpecialty": [
                    {
                        "id": 26,
                        "hospital_specialty_id": 14,
                        "hospitalSpecialty": {
                            "specialty_id": 50,
                            "specialty": {
                                "id": 50,
                                "name": "Cơ Xương Khớp"
                            }
                        }
                    },
                    {
                        "id": 27,
                        "hospital_specialty_id": 13,
                        "hospitalSpecialty": {
                            "specialty_id": 52,
                            "specialty": {
                                "id": 52,
                                "name": "Tiêu hoá"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": 6,
            "doctor_id": 31,
            "hospital_id": 4,
            "is_active": true,
            "isDeleted": false,
            "createdAt": "2024-09-28T02:39:16.237Z",
            "updatedAt": "2024-09-28T02:39:16.237Z",
            "doctor": {
                "id": 31,
                "description": "sdfsdfsdf",
                "user_id": 34,
                "user": {
                    "id": 34,
                    "fullname": "shhsdfsdfsdfsdfs",
                    "email": "letho11ffff112002@gmail.com",
                    "phone": "4232423"
                },
                "doctorSpecialty": [
                    {
                        "id": 28,
                        "hospital_specialty_id": 14,
                        "hospitalSpecialty": {
                            "specialty_id": 50,
                            "specialty": {
                                "id": 50,
                                "name": "Cơ Xương Khớp"
                            }
                        }
                    },
                    {
                        "id": 29,
                        "hospital_specialty_id": 13,
                        "hospitalSpecialty": {
                            "specialty_id": 52,
                            "specialty": {
                                "id": 52,
                                "name": "Tiêu hoá"
                            }
                        }
                    }
                ]
            }
        }
    ]
}