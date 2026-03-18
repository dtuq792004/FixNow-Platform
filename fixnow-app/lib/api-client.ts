import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "~/features/auth/stores/auth.store";

/**
 * Axios instance dùng chung cho toàn app.
 * - baseURL lấy từ EXPO_PUBLIC_API_URL (env)
 * - Request interceptor: tự động đính kèm Bearer token
 * - Response interceptor: chuẩn hoá lỗi về { message, status }
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
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "Network error. Please check your connection.";
    const status = error.response?.status;

    // Re-throw dưới dạng plain object để store xử lý
    return Promise.reject({ message, status });
  }
);

export default apiClient;
