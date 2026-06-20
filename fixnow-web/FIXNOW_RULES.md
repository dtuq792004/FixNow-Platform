# FIXNOW FRONTEND RULES

## 1. Tech Stack

Bắt buộc sử dụng:

* React + TypeScript
* Vite
* Tailwind CSS
* Shadcn/UI
* React Router
* TanStack Query
* React Hook Form
* Zod
* Zustand (nếu cần global state)

---

# 2. Architecture

Tổ chức theo module, không tổ chức theo loại file.

src/
│
├── app/
│   ├── router/
│   ├── providers/
│   └── store/
│
├── layouts/
│   ├── CustomerLayout.tsx
│   ├── ProviderLayout.tsx
│   └── AdminLayout.tsx
│
├── modules/
│
│   ├── auth/
│   ├── customer/
│   ├── provider/
│   ├── admin/
│   ├── request/
│   ├── service/
│   ├── payment/
│   ├── chat/
│   ├── notification/
│   └── profile/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── constants/
│   ├── types/
│   ├── utils/
│   └── validations/
│
├── assets/
│
└── main.tsx

Shared Components

Các component dùng toàn hệ thống

shared/components/
│
├── AppButton.tsx
├── AppInput.tsx
├── AppModal.tsx
├── AppTable.tsx
├── AppPagination.tsx
├── AppSkeleton.tsx
├── AppMap.tsx
└── StatusBadge.tsx

Rule:

Nếu dùng từ 2 module trở lên → đưa vào shared/components.

# 3. Routing & Role

Phân tách rõ:

```txt
/customer/*
/provider/*
/admin/*
```

Không hardcode role.

```ts
ROLES.CUSTOMER
ROLES.PROVIDER
ROLES.ADMIN
```

---

# 4. Layout

## Customer

```txt
Header
Content
Bottom Navigation (Mobile)
```

## Provider

```txt
Sidebar
Header
Content
```

## Admin

```txt
Sidebar
Header
Content
```

Sidebar phải cố định trên toàn bộ dashboard.

---

# 5. Design System

## Màu sắc

```txt
Primary: #2563EB
Success: #22C55E
Warning: #F59E0B
Danger : #EF4444
Background: #F8FAFC
```

## Font

```txt
Inter
```

## Border Radius

```txt
Input: 12px
Card: 16px
Button: 12px
```

---

# 6. Component Rules

* Component phải tái sử dụng được.
* Một component không nên vượt quá 300 dòng.
* Logic xử lý phải tách ra hook hoặc service.
* Không gọi API trực tiếp trong component.

Ví dụ:

```ts
providerService.getProfile()
```

---

# 7. Form Rules

Bắt buộc:

```txt
React Hook Form
Zod Validation
```

Mọi input phải có:

```txt
Label
Input
Error Message
```

---

# 8. UI States

Mọi màn hình phải có:

```txt
Loading State
Empty State
Error State
```

Ưu tiên Skeleton thay vì Spinner.

---

# 9. Responsive

Thiết kế Mobile First.

Breakpoint:

```txt
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

---

# 10. Status Color

## Request

```txt
PENDING       → Gray
ACCEPTED      → Blue
IN_PROGRESS   → Orange
COMPLETED     → Green
CANCELLED     → Red
```

## Payment

```txt
PENDING       → Orange
SUCCESS       → Green
FAILED        → Red
REFUNDED      → Purple
```

Không được tự đổi màu ở từng màn hình.

---

# 11. Naming Convention

## Component

```txt
PascalCase
```

Ví dụ:

```txt
ProviderCard.tsx
RequestDetail.tsx
```

## Hook

```txt
useSomething
```

Ví dụ:

```txt
useAuth.ts
useProvider.ts
```

## Service

```txt
providerService.ts
requestService.ts
```

---

# 12. Dashboard Menu

## Provider

```txt
Tổng quan
Đơn việc
Dịch vụ
Ví
Đánh giá
Tin nhắn
Thông báo
Hồ sơ
```

## Admin

```txt
Dashboard
Người dùng
Provider
Danh mục
Dịch vụ
Yêu cầu
Thanh toán
Ví
Khuyến mãi
Khiếu nại
Cài đặt
```

Không thay đổi vị trí menu giữa các trang.

---

# 13. Security

Không hiển thị:

```txt
Token
Password
Hash
CCCD
```

ra giao diện.

---

# 14. Core Business Flow

Toàn bộ giao diện phải xoay quanh các thực thể:

```txt
User
Provider
Service
Request
Payment
```

Luồng chính:

```txt
Customer tạo yêu cầu
↓
Hệ thống tìm Provider
↓
Provider nhận việc
↓
Thực hiện dịch vụ
↓
Hoàn thành
↓
Thanh toán
↓
Đánh giá
```

Mọi màn hình mới phải phục vụ hoặc hỗ trợ trực tiếp cho luồng này.

---

# 15. UI/UX Principles

* Giao diện sáng màu.
* Thiết kế tối giản, hiện đại.
* Ưu tiên thao tác nhanh.
* Mobile First.
* Đồng bộ giữa Customer, Provider và Admin.
* CTA rõ ràng.
* Trạng thái hiển thị rõ ràng.
* Ưu tiên Card Layout trên Mobile.
