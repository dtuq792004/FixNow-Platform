# Hướng Dẫn Test API FixNow

## Chuẩn bị
1. **Chạy server backend**: `npm run dev` (port mặc định: 3000)
2. **Base URL**: `http://localhost:3000`
3. **Công cụ test**: Postman, cURL, hoặc bất kỳ API client nào

## MODULE 1: XÁC THỰC & TÀI KHOẢN

### 1. Đăng ký tài khoản
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678"
  }'
```

### 2. Đăng nhập (LƯU TOKEN từ response)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

**Lưu token từ response** (ví dụ: `eyJhbGciOiJIUzI1NiIs...`) để dùng cho các request sau.

### 3. Lấy thông tin profile
```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 4. Cập nhật profile
```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn B",
    "phone": "0987654321"
  }'
```

### 5. Quên mật khẩu
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com"
  }'
```

### 6. Đăng xuất
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json"
```

## MODULE 2: QUẢN LÝ NGƯỜI DÙNG

### A. CUSTOMER - Quản lý địa chỉ

#### 1. Tạo địa chỉ mới
```bash
curl -X POST http://localhost:3000/addresses \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressLine1": "123 Đường ABC",
    "city": "Hà Nội",
    "district": "Quận Thanh Xuân",
    "ward": "Phường Khương Trung",
    "isDefault": true
  }'
```

#### 2. Xem danh sách địa chỉ
```bash
curl -X GET http://localhost:3000/addresses \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

#### 3. Cập nhật địa chỉ
```bash
curl -X PUT http://localhost:3000/addresses/ADDRESS_ID \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressLine1": "456 Đường DEF",
    "isDefault": false
  }'
```

#### 4. Xóa địa chỉ
```bash
curl -X DELETE http://localhost:3000/addresses/ADDRESS_ID \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

#### 5. Xem lịch sử dịch vụ
```bash
curl -X GET http://localhost:3000/addresses/service-history \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

#### 6. Gửi yêu cầu trở thành Provider
```bash
curl -X POST http://localhost:3000/provider-requests \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "ELECTRICIAN",
    "description": "Tôi có 5 năm kinh nghiệm",
    "experienceYears": 5
  }'
```

### B. PROVIDER - Cập nhật trạng thái

#### 1. Cập nhật trạng thái online/offline
```bash
curl -X PATCH http://localhost:3000/providers/status \
  -H "Authorization: Bearer PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activeStatus": "ONLINE"
  }'
```

### C. ADMIN - Quản lý yêu cầu Provider

#### 1. Xem danh sách yêu cầu
```bash
curl -X GET http://localhost:3000/provider-requests \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### 2. Duyệt yêu cầu
```bash
curl -X PATCH http://localhost:3000/provider-requests/REQUEST_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "adminNotes": "Đã xác minh"
  }'
```

## FLOW TEST GỢI Ý

### Flow 1: Customer cơ bản
1. Đăng ký → Đăng nhập → Lưu token
2. Get profile → Update profile
3. Tạo address → Get addresses
4. Gửi provider request

### Flow 2: Admin quản lý
1. Đăng nhập admin → Lưu token
2. Get provider requests
3. Duyệt request (cần ID từ flow 1)

### Flow 3: Provider
1. Đăng nhập provider (hoặc dùng account đã được duyệt)
2. Update provider status

## LƯU Ý QUAN TRỌNG

1. **Token**: Sau khi login, copy token từ response `data.token`
2. **Role**: Mỗi endpoint chỉ cho phép role cụ thể
3. **ID**: Cần thay `ADDRESS_ID`, `REQUEST_ID` bằng ID thực tế từ response
4. **Error**: Nếu gặp 403 Forbidden → kiểm tra role của token

## TROUBLESHOOTING

- **401 Unauthorized**: Token hết hạn hoặc sai → login lại
- **403 Forbidden**: Sai role → dùng token đúng role
- **404 Not Found**: Endpoint sai hoặc ID không tồn tại
- **500 Server Error**: Kiểm tra logs backend

## TEST NHANH VỚI SCRIPT

Tạo file `test.sh`:
```bash
#!/bin/bash
BASE_URL="http://localhost:3000"

# 1. Register
echo "=== 1. Register ==="
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User","phone":"0912345678"}'

echo -e "\n\n=== 2. Login ==="
# 2. Login (lưu token thủ công từ output)
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Chạy: `bash test.sh`

---

**Chúc test thành công!** 🚀