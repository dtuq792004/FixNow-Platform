import { useCallback, useState } from "react";
import apiClient from "~/lib/api-client";
import type { AuthUser } from "~/features/auth/types/auth.types";
import type { ProviderApplication } from "../types";
import type { RegisterProviderFormData } from "../validations/schemas";
import { ServiceCategoryType } from "~/features/home/types";

export const useProviderApplication = () => {
  const [application, setApplication] = useState<ProviderApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (data: RegisterProviderFormData, user: AuthUser) => {
      try {
        setLoading(true);
        setError(null);

        // Submit to backend
        const response = await apiClient.post("/provider-request/", {
          description: data.experience,
          experienceYears: parseInt(data.experience) || 0, // Extract years from experience
          serviceCategories: data.specialties as ServiceCategoryType[], // Assuming specialties are sent as an array of category IDs
          workingAreas: [data.serviceArea],
        });

        // Map backend response to frontend ProviderApplication
        const newApp: ProviderApplication = {
          id: response.data?.data?._id || `app-${Date.now()}`,
          status: response.data?.data?.status || "pending",
          submitted_at:
            response.data?.data?.createdAt || new Date().toISOString(),
          fullName: user.fullName,
          phone: user.phone ?? "",
          specialties: data.specialties as ServiceCategoryType[],
          experience: data.experience,
          serviceArea: data.serviceArea,
          idCard: data.idCard,
          motivation: data.motivation,
        };

        setApplication(newApp);
        return newApp;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to submit application";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { application, submit, loading, error };
};
