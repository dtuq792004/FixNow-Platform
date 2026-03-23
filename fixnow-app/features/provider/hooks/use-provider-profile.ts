import { useCallback, useState, useEffect } from "react";
import apiClient from "~/lib/api-client";

export interface ProviderFeedback {
  _id: string;
  customerId: any;
  providerId: string;
  rating: number;
  comment: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export function useProviderProfile() {
  const [feedbacks, setFeedbacks] = useState<ProviderFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);

  // Fetch feedbacks for current provider
  const fetchFeedbacks = useCallback(async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/feedback/provider/${providerId}`);
      setFeedbacks(response.data?.data || []);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to load feedbacks";
      setError(errorMsg);
      console.error("fetchFeedbacks error:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reply to feedback
  const replyFeedback = useCallback(
    async (feedbackId: string, replyContent: string) => {
      try {
        setReplyLoading(true);
        setError(null);
        await apiClient.patch(`/feedback/reply/${feedbackId}`, {
          replyContent,
        });
        // Update local feedbacks
        setFeedbacks((prev) =>
          prev.map((f) =>
            f._id === feedbackId
              ? {
                  ...f,
                  reply: replyContent,
                  repliedAt: new Date().toISOString(),
                }
              : f,
          ),
        );
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || "Failed to reply feedback";
        setError(errorMsg);
        throw err;
      } finally {
        setReplyLoading(false);
      }
    },
    [],
  );

  // Update provider status (online/offline)
  const updateStatus = useCallback(
    async (activeStatus: "ONLINE" | "OFFLINE") => {
      try {
        setError(null);
        await apiClient.patch("/provider/status", { activeStatus });
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || "Failed to update status";
        setError(errorMsg);
        throw err;
      }
    },
    [],
  );

  // Update working areas
  const updateWorkingArea = useCallback(async (workingAreas: string[]) => {
    try {
      setError(null);
      await apiClient.patch("/provider/working-area", { workingAreas });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to update working area";
      setError(errorMsg);
      throw err;
    }
  }, []);

  return {
    feedbacks,
    loading,
    error,
    replyLoading,
    fetchFeedbacks,
    replyFeedback,
    updateStatus,
    updateWorkingArea,
  };
}
