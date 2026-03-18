import { useCallback, useState } from 'react';
import type { AuthUser } from '~/features/auth/types/auth.types';
import type { ServiceCategoryType } from '~/features/home/types';
import type { ProviderApplication } from '../types';
import type { RegisterProviderFormData } from '../validations/schemas';

// Module-level store — persists across navigations without Zustand
let _application: ProviderApplication | null = null;

export const useProviderApplication = () => {
  const [application, setApplication] = useState<ProviderApplication | null>(_application);

  const submit = useCallback(
    (data: RegisterProviderFormData, user: AuthUser) => {
      const newApp: ProviderApplication = {
        id: `app-${Date.now()}`,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        fullName: user.fullName,
        phone: user.phone ?? '',
        specialties: data.specialties as ServiceCategoryType[],
        experience: data.experience,
        serviceArea: data.serviceArea,
        idCard: data.idCard,
        motivation: data.motivation,
      };
      _application = newApp;
      setApplication(newApp);
      return newApp;
    },
    []
  );

  return { application, submit };
};
