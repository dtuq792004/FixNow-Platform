import type { CreateRequestFormData, CreateRequestResponse } from '../types';

// TODO: replace with real API client when backend is ready
// import { apiClient } from '~/lib/api-client';

/**
 * Submit a new service request.
 * Currently simulates a network delay — swap the body with a real API call.
 */
export const createRequestApi = async (
  data: CreateRequestFormData
): Promise<CreateRequestResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // TODO: return apiClient.post('/requests', data);
  return {
    id: `REQ-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
};
