import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFeedbackApi,
  getProviderFeedbacksApi,
  getRequestFeedbackApi,
  hasFeedbackForRequestApi,
  type CreateFeedbackDto,
} from '../services/feedback.service';

// ── Customer hooks ────────────────────────────────────────────────────────────

/** Boolean check — has this customer already submitted feedback for a request? */
export const useHasFeedback = (requestId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['feedback', 'has', requestId],
    queryFn: () => hasFeedbackForRequestApi(requestId),
    enabled: enabled && !!requestId,
    staleTime: 1000 * 60 * 5,
  });

/** Submit feedback — optimistically marks request as reviewed on success. */
export const useCreateFeedback = (requestId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFeedbackDto) => createFeedbackApi(dto),
    onSuccess: () => {
      queryClient.setQueryData(['feedback', 'has', requestId], true);
      // Invalidate provider view of this request's feedback
      queryClient.invalidateQueries({ queryKey: ['feedback', 'request', requestId] });
    },
  });
};

// ── Provider hooks ────────────────────────────────────────────────────────────

/**
 * Fetch the customer's feedback for a single completed job.
 * Provider-side only — enabled when job.status === 'COMPLETED'.
 */
export const useRequestFeedback = (requestId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['feedback', 'request', requestId],
    queryFn: () => getRequestFeedbackApi(requestId),
    enabled: enabled && !!requestId,
    staleTime: 1000 * 60 * 2,
  });

/**
 * Infinite paginated list of all feedbacks for a provider.
 * Used in the "all reviews" screen of a provider profile.
 * `providerId` must be Provider._id.
 */
export const useProviderFeedbacks = (providerId: string) =>
  useInfiniteQuery({
    queryKey: ['feedback', 'provider', providerId],
    queryFn: ({ pageParam = 1 }) => getProviderFeedbacksApi(providerId, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled: !!providerId,
    staleTime: 1000 * 60 * 3,
  });
