import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "~/features/auth/stores/auth.store";

/**
 * Axios instance dùng chung cho toàn app.
 * - baseURL lấy từ EXPO_PUBLIC_API_URL (env)
 * - Request interceptor: tự động đính kèm Bearer token
 * - Response interceptor: chuẩn hoá lỗi về { message, status }, tự refresh token khi 401
 */
const isLocalAddress = (value: string) =>
  value.includes("localhost") || value.includes("127.0.0.1");

const getApiBaseUrl = () => {
  const envBaseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (envBaseUrl) {
    if (Platform.OS === "android" && isLocalAddress(envBaseUrl)) {
      if (expoHost && !isLocalAddress(expoHost)) {
        return `http://${expoHost}:5000`;
      }

      return envBaseUrl
        .replace("localhost", "10.0.2.2")
        .replace("127.0.0.1", "10.0.2.2");
    }

    return envBaseUrl;
  }

  if (expoHost && !isLocalAddress(expoHost)) {
    return `http://${expoHost}:5000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  return "http://localhost:5000";
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
  withCredentials: true, // send httpOnly refreshToken cookie
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processPendingQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Try token refresh on 401, but not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      if (isRefreshing) {
        // Queue subsequent requests while refresh is in progress
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<{ accessToken: string }>("/auth/refresh");
        const newToken = data.accessToken;

        // Update store with new access token
        const currentSession = useAuthStore.getState().session;
        if (currentSession) {
          useAuthStore.getState().setSession({ ...currentSession, access_token: newToken });
        }

        processPendingQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError, null);
        // Refresh failed — sign out
        await useAuthStore.getState().signOut();
        return Promise.reject({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", status: 401 });
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ??
      error.message ??
      "Network error. Please check your connection.";
    const status = error.response?.status;

    return Promise.reject({ message, status });
  }
);

export default apiClient;

