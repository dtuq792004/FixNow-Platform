import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFeedbackApi,
  hasFeedbackForRequestApi,
  type CreateFeedbackDto,
} from '../services/feedback.service';

/** Check if the current user has already submitted feedback for a request. */
export const useHasFeedback = (requestId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['feedback', 'request', requestId],
    queryFn: () => hasFeedbackForRequestApi(requestId),
    enabled: enabled && !!requestId,
    staleTime: 1000 * 60 * 5, // 5 min — unlikely to change while screen is open
  });

/** Submit feedback — invalidates the hasFeedback query on success. */
export const useCreateFeedback = (requestId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFeedbackDto) => createFeedbackApi(dto),
    onSuccess: () => {
      queryClient.setQueryData(['feedback', 'request', requestId], true);
    },
  });
};
