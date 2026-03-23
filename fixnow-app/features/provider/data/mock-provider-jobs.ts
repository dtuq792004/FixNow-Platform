export type ProviderJobStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ACCEPTED";

export type ProviderJob = {
  _id?: string;
  id?: string;
  customerName: string;
  customerAvatar?: string;
  serviceCategory: string;
  serviceName: string;
  description: string;
  address: string;
  district: string;
  status: ProviderJobStatus;
  requestType: "NORMAL" | "URGENT";
  estimatedPrice?: number;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
};

export const MOCK_PROVIDER_JOBS: ProviderJob[] = [
  {
    id: "JOB-001",
    customerName: "Nguyễn Văn Hùng",
    serviceCategory: "plumbing",
    serviceName: "Sửa ống nước",
    description: "Ống dẫn nước bồn rửa bát bị rò rỉ, cần sửa gấp",
    address: "12 Lê Lợi, Phường 1",
    district: "Quận 1, TP.HCM",
    status: "PENDING",
    requestType: "URGENT",
    estimatedPrice: 250000,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "JOB-002",
    customerName: "Trần Thị Mai",
    serviceCategory: "electrical",
    serviceName: "Sửa điện",
    description: "Ổ điện phòng khách bị chập, cần kiểm tra và thay thế",
    address: "45 Nguyễn Huệ, Phường 4",
    district: "Quận 3, TP.HCM",
    status: "PENDING",
    requestType: "NORMAL",
    estimatedPrice: 180000,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "JOB-003",
    customerName: "Phạm Quốc Tuấn",
    serviceCategory: "hvac",
    serviceName: "Vệ sinh máy lạnh",
    description: "Máy lạnh Panasonic 1.5HP, cần vệ sinh toàn bộ",
    address: "8 Đinh Tiên Hoàng, Phường Đa Kao",
    district: "Quận 1, TP.HCM",
    status: "ASSIGNED",
    requestType: "NORMAL",
    estimatedPrice: 300000,
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "JOB-004",
    customerName: "Lê Thị Lan",
    serviceCategory: "plumbing",
    serviceName: "Thông bồn cầu",
    description: "Bồn cầu bị tắc, không xả được",
    address: "22 Trần Hưng Đạo, Phường 9",
    district: "Quận 5, TP.HCM",
    status: "IN_PROGRESS",
    requestType: "URGENT",
    estimatedPrice: 200000,
    scheduledAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "JOB-005",
    customerName: "Võ Minh Khoa",
    serviceCategory: "painting",
    serviceName: "Sơn tường",
    description: "Sơn lại phòng ngủ 15m², tường bị bong tróc nhiều",
    address: "67 Cách Mạng Tháng 8",
    district: "Quận 10, TP.HCM",
    status: "COMPLETED",
    requestType: "NORMAL",
    estimatedPrice: 1500000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "JOB-006",
    customerName: "Hoàng Thu Hà",
    serviceCategory: "electrical",
    serviceName: "Lắp đèn",
    description: "Lắp 4 đèn LED âm trần phòng khách",
    address: "5 Bùi Viện, Phường Phạm Ngũ Lão",
    district: "Quận 1, TP.HCM",
    status: "COMPLETED",
    requestType: "NORMAL",
    estimatedPrice: 400000,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
