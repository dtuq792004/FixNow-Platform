# FixNow Web - Realtime Location Tracking Implementation

## Mục tiêu

Tài liệu này mô tả luồng realtime tracking vị trí kỹ thuật viên trong hệ thống FixNow, từ backend socket đến frontend web.

## Kiến trúc tổng quan

- Backend sử dụng `socket.io` để quản lý kết nối realtime.
- Client web tạo socket được xác thực với JWT.
- Khách hàng (customer) tham gia phòng tracking theo `requestId`.
- Backend trả snapshot vị trí hiện tại và phát các cập nhật vị trí mới đến những client đang tham gia phòng đó.
- Frontend web hiển thị vị trí kỹ thuật viên và khách hàng trên bản đồ Leaflet.

## Backend

### 1. Khởi tạo Socket

File: `fixnow-backend/src/sockets/initSocket.ts`

- Tạo `socket.io` server với cấu hình CORS cho các origin được phép.
- Thực hiện middleware xác thực bằng JWT từ `socket.handshake.auth.token` hoặc `socket.handshake.headers.token`.
- Nếu xác thực thành công, user được gán vào `socket.user`.
- Khi kết nối, socket tự động join một room riêng theo `user.id`.
- Đăng ký các handler:
  - `registerChatHandlers`
  - `registerLocationHandlers`
  - `registerNotificationHandlers`

### 2. Room tracking vị trí

File: `fixnow-backend/src/sockets/location.socket.ts`

#### Event `location:join_request`

- Payload: `{ requestId }`
- Backend:
  - Kiểm tra `requestId` tồn tại.
  - Gọi `canJoinRequestLocationRoom(requestId, user.id)` để kiểm tra quyền truy cập.
  - Nếu hợp lệ, socket join room tên `request_location:${requestId}`.
  - Nếu request đã có `providerId`, backend lấy vị trí provider mới nhất (`getProviderLocation`) và emit snapshot cho client mới:
    - event: `location:provider_snapshot`
    - payload: `{ requestId, providerId, location }`
  - Cuối cùng emit `location:joined_request`.

#### Event `location:leave_request`

- Payload: `{ requestId }`
- Backend:
  - Kiểm tra payload.
  - socket.leave(room)
  - emit `location:left_request` cho client.

#### Event `location:update`

- Payload: `{ requestId, lat, lng, accuracy?, heading?, speed? }`
- Backend:
  - Xác thực `requestId`, `lat`, `lng` hợp lệ.
  - Kiểm tra xem user có quyền cập nhật vị trí request hay không bằng `canJoinRequestLocationRoom`.
  - Chỉ `provider` được gán cho đơn và request ở trạng thái `ACCEPTED` hoặc `IN_PROGRESS` mới được phép cập nhật.
  - Lưu vị trí provider vào DB bằng `updateProviderLocation`.
  - Broadcast đến tất cả client trong room `request_location:${requestId}`:
    - event: `location:provider_updated`
    - payload: `{ requestId, providerId, location }`
  - Emit `location:updated` cho chính provider cập nhật.

#### Event `disconnect`

- Nếu user có role `PROVIDER`, backend gọi `markProviderOffline(user.id)`.

### 3. Service vị trí

File: `fixnow-backend/src/services/location.service.ts`

- `updateProviderLocation({ providerId, lat, lng, accuracy, heading, speed })`
  - Dùng `Location.findOneAndUpdate` với `upsert: true`.
  - Ghi `isOnline: true` và `lastSeenAt: new Date()`.
- `markProviderOffline(providerId)`
  - Cập nhật `isOnline: false` và `lastSeenAt`.
- `getProviderLocation(providerId)`
  - Lấy vị trí provider hiện tại từ collection `Location`.
- `canJoinRequestLocationRoom(requestId, userId)`
  - Tải request với `customerId`, `providerId`, `status`.
  - Cho phép nếu user là customer hoặc provider được gán.

## Frontend Web

### 1. Socket client chung

File: `fixnow-web/src/shared/services/socketClient.ts`

- Duy trì một socket singleton.
- Kết nối với `API_BASE_URL` từ env.
- Gửi JWT qua `auth: { token: accessToken }`.
- `getAuthenticatedSocket(accessToken)`:
  - Nếu token mới hoặc socket chưa tồn tại thì tạo lại connection.
  - Trả về instance `socket`.
- `disconnectAuthenticatedSocket()` để đóng socket.

### 2. Hook tracking provider

File: `fixnow-web/src/modules/request/hooks/useProviderTracking.ts`

- Tham số: `requestId`, `enabled`.
- State:
  - `providerLocation`
  - `accuracy`
  - `lastUpdatedAt`
  - `isOnline`
  - `isWaiting`
  - `error`
- Khi `accessToken`, `requestId`, `enabled` hợp lệ:
  - Lấy socket với `getAuthenticatedSocket(accessToken)`.
  - Gọi `socket.emit('location:join_request', { requestId })`.
  - Đăng ký các listener:
    - `location:provider_snapshot` -> `applyLocation`
    - `location:provider_updated` -> `applyLocation`
    - `location:joined_request` -> xóa lỗi nếu join thành công
    - `location:error` -> hiển thị lỗi phù hợp
- Hàm `applyLocation(payload)`:
  - Chỉ xử lý khi `payload.requestId === requestId`.
  - Cập nhật `providerLocation`, `accuracy`, `lastUpdatedAt`, `isOnline`, `isWaiting=false`, `error=null`.
- Cleanup:
  - emit `location:leave_request`
  - off các listener

### 3. Component hiển thị tracking

File: `fixnow-web/src/modules/request/components/CustomerProviderTracking.tsx`

- Dùng `useProviderTracking(requestId, canTrack)`.
- `canTrack` chỉ true khi:
  - request đã có provider
  - status là `ACCEPTED` hoặc `IN_PROGRESS`
- Nếu customer không có tọa độ, hiển thị cảnh báo và nút geocode.
- Nếu chưa có provider, thông báo thành phần chưa sẵn sàng.
- Nếu có lỗi tracking, hiển thị thông báo lỗi.
- Nếu có vị trí provider và customer, render `AppMap`.
- Tính khoảng cách giữa customer và provider bằng công thức Haversine.
- Hiển thị:
  - trạng thái online của provider
  - độ chính xác GPS
  - thời điểm cập nhật cuối
  - khoảng cách đến khách hàng

### 4. Bản đồ

File: `fixnow-web/src/shared/components/AppMap.tsx`

- Dùng `react-leaflet` và OpenStreetMap tile.
- Marker riêng cho customer và provider.
- Hiển thị đường thẳng (`Polyline`) nối hai điểm.
- Tự động fit bounds khi có cả hai điểm.

### 5. Trang tracking

File: `fixnow-web/src/modules/request/pages/TrackingProcessPage.tsx`

- Tải chi tiết request.
- Gọi `CustomerProviderTracking` với `requestId`, `status`, `address`, tọa độ khách hàng.
- Cập nhật dữ liệu khi request thay đổi.

## Luồng hoạt động thực tế

1. Khách hàng truy cập trang tracking.
2. `TrackingProcessPage` tải request và truyền `requestId` cho `CustomerProviderTracking`.
3. `CustomerProviderTracking` gọi `useProviderTracking`.
4. Hook mở kết nối socket được xác thực và emit `location:join_request`.
5. Backend kiểm tra quyền, join room `request_location:${requestId}`.
6. Backend gửi snapshot vị trí provider hiện tại về client qua `location:provider_snapshot`.
7. Khi provider gửi update vị trí bằng event `location:update`:
   - Backend lưu vị trí mới.
   - Backend broadcast `location:provider_updated` đến room.
8. Frontend nhận event và cập nhật vị trí hiển thị trên bản đồ.

## Event chính

- Frontend -> Backend:
  - `location:join_request`
  - `location:leave_request`
- Backend -> Frontend:
  - `location:provider_snapshot`
  - `location:provider_updated`
  - `location:joined_request`
  - `location:error`

## Ghi chú

- Backend xác thực socket bằng JWT trước khi cho phép join room.
- Chỉ customer và provider của request mới được phép xem tracking.
- Chỉ provider gán cho request mới có thể gửi `location:update`.
- Tracking chỉ thực sự hiển thị khi request đang ở trạng thái `ACCEPTED` hoặc `IN_PROGRESS`.

## Tổng kết

Luồng tracking realtime FixNow web hoạt động dựa trên Socket.IO:

- Backend quản lý room theo `requestId` và quyền user.
- Frontend web join room rồi lắng nghe snapshot/cập nhật vị trí.
- Bản đồ Leaflet hiển thị khách hàng, provider và đường đi ngắn nhất.

File tham chiếu chính:
- `fixnow-backend/src/sockets/initSocket.ts`
- `fixnow-backend/src/sockets/location.socket.ts`
- `fixnow-backend/src/services/location.service.ts`
- `fixnow-web/src/shared/services/socketClient.ts`
- `fixnow-web/src/modules/request/hooks/useProviderTracking.ts`
- `fixnow-web/src/modules/request/components/CustomerProviderTracking.tsx`
- `fixnow-web/src/shared/components/AppMap.tsx`
- `fixnow-web/src/modules/request/pages/TrackingProcessPage.tsx`
