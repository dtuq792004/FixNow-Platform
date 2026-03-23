import { useCallback, useState } from 'react';
import type { ProviderApplication } from '../types';
import type { RegisterProviderFormData } from '../validations/schemas';
import { submitProviderApplication, getMyProviderApplication } from '../services/provider.service';

// Module-level store — persists across navigations without Zustand
let _application: ProviderApplication | null = null;

export const useProviderApplication = () => {
  const [application, setApplication] = useState<ProviderApplication | null>(_application);
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (data: RegisterProviderFormData) => {
      try {
        setLoading(true);
        const response = await submitProviderApplication(data);
        
        // Update local state
        _application = response;
        setApplication(response);
        
        return response;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkExistingApplication = useCallback(
    async () => {
      try {
        setLoading(true);
        
        // First check local state
        if (_application) {
          setApplication(_application);
          return _application;
        }

        // Then check API
        const data = await getMyProviderApplication();
        if (data) {
          _application = data;
          setApplication(data);
          return data;
        }

        return null;
      } catch (error) {
        console.error('Error checking existing application:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearApplication = useCallback(() => {
    _application = null;
    setApplication(null);
  }, []);

  const refetch = useCallback(() => {
    // Trigger refetch by clearing and checking again
    _application = null;
    setApplication(null);
    return checkExistingApplication();
  }, [checkExistingApplication]);

  return { 
    application, 
    submit, 
    loading, 
    checkExistingApplication, 
    clearApplication, 
    refetch 
  };
};
