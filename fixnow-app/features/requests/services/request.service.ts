import apiClient from "~/lib/api-client";
import type {
  RequestStatus,
  ServiceCategoryType,
} from "~/features/requests/types";
import type {
  CreateRequestFormData,
  CreateRequestResponse,
  ServiceRequestDetail,
} from "../types";

type BackendRequestStatus =
  | "AWAITING_PAYMENT"
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

interface BackendService {
  _id: string;
  name?: string;
  category?: ServiceCategoryType;
}

interface BackendAddress {
  _id: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
}

interface BackendProvider {
  _id: string;
  fullName?: string;
  name?: string;
  avatar?: string;
  rating?: number;
  phone?: string;
}

interface BackendRequestItem {
  _id: string;
  services?: Array<BackendService | string>;
  addressId?: BackendAddress | string;
  description?: string;
  status: BackendRequestStatus | string;
  customerId?: string;
  providerId?: BackendProvider | string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateRequestApiResponse {
  message: string;
  data: BackendRequestItem;
  checkoutUrl?: string;
}

interface RequestListApiResponse {
  data: BackendRequestItem[];
}

interface RequestSingleApiResponse {
  message: string;
  data: BackendRequestItem;
}

const STATUS_MAP: Record<string, RequestStatus> = {
  AWAITING_PAYMENT: "pending",
  PENDING: "pending",
  ACCEPTED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const toRequestStatus = (raw: string): RequestStatus =>
  STATUS_MAP[raw] ?? "pending";

const toCategory = (service?: BackendService | string): ServiceCategoryType => {
  if (service && typeof service === "object" && service.category) {
    return service.category;
  }
  return "other";
};

const toTitle = (service?: BackendService | string) => {
  if (service && typeof service === "object" && service.name) {
    return service.name;
  }
  return "Yeu cau dich vu";
};

const toAddress = (address?: BackendAddress | string) => {
  if (address && typeof address === "object") {
    return [address.addressLine, address.ward, address.district, address.city]
      .filter(Boolean)
      .join(", ");
  }

  if (typeof address === "string" && address.trim()) {
    return address;
  }

  return "Dia chi dang cap nhat";
};

const mapRequestDetail = (raw: BackendRequestItem): ServiceRequestDetail => {
  const firstService = raw.services?.[0];
  const provider =
    raw.providerId && typeof raw.providerId === "object"
      ? {
          id: raw.providerId._id,
          name: raw.providerId.fullName ?? raw.providerId.name ?? "Tho sua",
          avatar: raw.providerId.avatar,
          rating: raw.providerId.rating,
          phone: raw.providerId.phone,
        }
      : undefined;

  return {
    id: raw._id,
    title: toTitle(firstService),
    description: raw.description ?? "",
    category: toCategory(firstService),
    status: toRequestStatus(raw.status),
    address: toAddress(raw.addressId),
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
    provider,
  };
};

export const createRequestApi = async (
  data: CreateRequestFormData,
): Promise<CreateRequestResponse> => {
  const res = await apiClient.post<CreateRequestApiResponse>("/requests", data);
  const created = res.data.data;

  return {
    id: created._id,
    status: toRequestStatus(created.status),
    created_at: created.createdAt,
  };
};

export const fetchMyRequestsApi = async (): Promise<ServiceRequestDetail[]> => {
  const res = await apiClient.get<RequestListApiResponse>("/requests/customer");
  return res.data.data.map(mapRequestDetail);
};

export const cancelRequestApi = async (
  id: string,
): Promise<ServiceRequestDetail> => {
  const res = await apiClient.patch<RequestSingleApiResponse>(
    `/requests/${id}/cancel`,
  );
  return mapRequestDetail(res.data.data);
};
