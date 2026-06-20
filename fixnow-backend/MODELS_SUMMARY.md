# Tổng quan Models (dành cho thiết kế giao diện)

Tập tin này tóm tắt đầy đủ các models trong `fixnow-backend/src/models` với các field, kiểu dữ liệu và ghi chú (required / default / enum / tham chiếu) để phục vụ thiết kế giao diện.

---

**Address**
- **userId**: ObjectId (ref `User`, required)
- **label**: string (required)
- **addressLine**: string (required)
- **ward**: string (required)
- **district**: string (required)
- **city**: string (required)
- **latitude**: number (optional)
- **longitude**: number (optional)
- **isDefault**: boolean (default: false)
- **createdAt**: Date (timestamp)
- **updatedAt**: Date (timestamp)

**Category**
- **name**: string (required)
- **type**: string (enum: ['electrical','plumbing','hvac','appliance','security','painting','other'], default: 'other')
- **description**: string (default: "")
- **isActive**: boolean (default: true)
- **createdAt** / **updatedAt**: Date (timestamps)

**Complaint**
- **requestId**: ObjectId (ref `Request`, required)
- **customerId**: ObjectId (ref `User`, required)
- **providerId**: ObjectId (ref `User`, required)
- **content**: string (required)
- **warrantyRequested**: boolean (default: false)
- **status**: enum (OPEN | PROCESSING | RESOLVED, default: OPEN)
- **handledBy**: ObjectId (ref `User`, optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**Conversation**
- **participants**: ObjectId[] (ref `User`, required)
- **lastMessage**: ObjectId (ref `Message`, optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**Feedback (RequestFeedback)**
- **requestId**: ObjectId (ref `Request`, required, unique)
- **customerId**: ObjectId (ref `User`, required)
- **providerId**: ObjectId (ref `Provider`, required)
- **providerReply**: string (optional)
- **status**: enum ('VISIBLE' | 'HIDDEN', default: 'VISIBLE')
- **servicesFeedbacks**: array of ServiceFeedback
  - ServiceFeedback: **serviceId**: ObjectId (ref `Service`, optional), **rating**: number (1-5, required), **comment**: string (optional)
- **createdAt**: Date (timestamps; createdAt only)

**Location**
- **providerId**: ObjectId (ref `User`, required, unique, indexed)
- **lat**: number (required)
- **lng**: number (required)
- **accuracy**: number (optional)
- **heading**: number (optional)
- **speed**: number (optional)
- **isOnline**: boolean (default: true)
- **lastSeenAt**: Date (default: now, indexed)
- **createdAt** / **updatedAt**: Date (timestamps)

**Message**
- **conversationId**: ObjectId (ref `Conversation`, required)
- **sender**: ObjectId (ref `User`, required)
- **content**: string (required)
- **type**: enum (TEXT | IMAGE, default: TEXT)
- **seen**: boolean (default: false)
- **createdAt** / **updatedAt**: Date (timestamps)

**Notification**
- **recipientId**: ObjectId (ref `User`, required)
- **title**: string (required)
- **message**: string (required)
- **type**: enum (SYSTEM | TICKET_CREATED | TICKET_RESOLVED | WARRANTY_REQUESTED, required)
- **entityId**: ObjectId (optional)
- **entityType**: string (optional)
- **isRead**: boolean (default: false)
- **createdAt**: Date (timestamp)

**Payment**
- **requestId**: ObjectId (ref `Request`, required)
- **customerId**: ObjectId (ref `User`, required)
- **providerId**: ObjectId (ref `User`, optional)
- **orderCode**: number (required, unique)
- **amount**: number (required)
- **platformFee**: number (required)
- **providerAmount**: number (required)
- **status**: enum ('PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED', default: 'PENDING')
- **transactionRef**: string (optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**PlatformSetting**
- **platformFeePercent**: number (required, 0-100, default: 20)
- **minWithdrawAmount**: number (default: 100000)
- **updatedBy**: ObjectId (ref `User`, optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**Promotion**
- **code**: string (required, unique, uppercase)
- **discountType**: enum ('PERCENT' | 'AMOUNT', required)
- **discountValue**: number (required)
- **usageLimit**: number | null (default: null)
- **usedCount**: number (default: 0)
- **expiredAt**: Date | null (default: null)
- **isActive**: boolean (default: true)
- **createdAt** / **updatedAt**: Date (timestamps)

**Provider**
- **userId**: ObjectId (ref `User`, required, unique)
- **description**: string (required)
- **experienceYears**: number (required)
- **activeStatus**: enum (ONLINE | OFFLINE, default OFFLINE)
- **verified**: boolean (default: false)
- **serviceCategories**: ObjectId[] (ref `Category`)
- **workingAreas**: string[]
- **createdAt** / **updatedAt**: Date (timestamps)

**ProviderRequest**
- **userId**: ObjectId (ref `User`, required)
- **fullName**: string (required)
- **phone**: string (required)
- **experience**: string (required)
- **specialties**: ObjectId[] (ref `Category`)
- **serviceArea**: string (required)
- **idCard**: string (required)
- **motivation**: string (optional)
- **status**: enum (PENDING | APPROVED | REJECTED, default: PENDING)
- **reviewedBy**: ObjectId (ref `User`, optional)
- **reviewedAt**: Date (optional)
- **rejectionReason**: string (optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**Request**
- **customerId**: ObjectId (ref `User`, required)
- **providerId**: ObjectId (ref `User`, optional)
- **categoryId**: ObjectId (ref `Category`, optional)
- **services**: ObjectId[] (ref `Service`)
- **addressId**: ObjectId (ref `Address`, optional)
- **addressText**: string (optional)
- **title**: string (optional)
- **description**: string (optional)
- **note**: string (optional)
- **media**: string[] (optional)
- **requestType**: enum ('NORMAL' | 'URGENT' | 'RECURRING', default: 'NORMAL')
- **totalPrice**: number (default: 0)
- **discountAmount**: number (default: 0)
- **finalPrice**: number (default: 0)
- **promoCode**: string (optional)
- **status**: enum (AWAITING_PAYMENT | PENDING | ACCEPTED | IN_PROGRESS | COMPLETED | CANCELLED, default: PENDING)
- **startAt**: Date (default: now)
- **providerCompletedAt**: Date (optional)
- **completionMedia**: string[] (optional)
- **completionNote**: string (optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**Service**
- **providerId**: ObjectId (ref `User`, required)
- **categoryId**: ObjectId (ref `Category`, optional)
- **name**: string (required)
- **description**: string (optional)
- **price**: number (required)
- **unit**: enum ('hour' | 'job', default: 'job')
- **status**: enum ('PENDING' | 'APPROVED' | 'REJECTED', default: 'PENDING')
- **image**: string[] (optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**ServiceHistory**
- **customerId**: ObjectId (ref `User`, required)
- **providerId**: ObjectId (ref `Provider`, required)
- **serviceId**: ObjectId (ref `Service`, required)
- **addressId**: ObjectId (ref `Address`, required)
- **status**: string (required)
- **completedAt**: Date (optional)
- **createdAt**: Date (createdAt only)

**Session**
- **userId**: ObjectId (ref `users`, required, indexed)
- **refreshToken**: string (required, unique)
- **expiresAt**: Date (required) — indexed with TTL
- **createdAt** / **updatedAt**: Date (timestamps)

**User**
- **email**: string (required, unique)
- **passwordHash**: string (required)
- **fullName**: string (required)
- **phone**: string (optional)
- **avatar**: string | null (default: null)
- **role**: enum ('CUSTOMER' | 'PROVIDER' | 'ADMIN', default: 'CUSTOMER')
- **status**: enum ('ACTIVE' | 'INACTIVE' | 'BANNED', default: 'ACTIVE')
- **resetPasswordTokenHash**: string (optional)
- **resetPasswordExpire**: Date (optional)
- **resetPasswordOtp**: string (optional)
- **resetPasswordOtpExpire**: Date (optional)
- **createdAt** / **updatedAt**: Date (timestamps)

**Wallet**
- **userId**: ObjectId (ref `User`, required, unique, indexed)
- **balance**: number (default: 0)
- **pending**: number (default: 0)
- **totalEarned**: number (default: 0)
- **totalWithdrawn**: number (default: 0)
- **createdAt** / **updatedAt**: Date (timestamps)

**WithdrawRequest**
- **userId**: ObjectId (ref `User`, required, indexed)
- **amount**: number (required)
- **status**: enum ('PENDING' | 'APPROVED' | 'REJECTED', default: 'PENDING')
- **bankName**: string (required)
- **accountNumber**: string (required)
- **accountHolder**: string (required)
- **processedBy**: ObjectId (ref `User`, optional)
- **rejectReason**: string (optional)
- **processedAt**: Date (optional)
- **createdAt** / **updatedAt**: Date (timestamps)

---

File gốc models: `fixnow-backend/src/models` — xem để đối chiếu.

Nếu bạn muốn, tôi có thể: xuất file này ra PDF, bổ sung ví dụ dữ liệu (sample JSON) cho từng model, hoặc tách thành các trang riêng cho Figma/Zeplin.
