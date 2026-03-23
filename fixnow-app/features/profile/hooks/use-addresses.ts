import { useCallback, useEffect, useState } from 'react';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from '~/features/profile/services/address.service';
import type { SavedAddress } from '~/features/profile/types';
import type { AddressFormData } from '~/features/profile/validations/schemas';

interface UseAddressesReturn {
  addresses: SavedAddress[];
  isLoading: boolean;
  error: string | null;
  add: (data: AddressFormData) => Promise<void>;
  update: (id: string, data: AddressFormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export const useAddresses = (): UseAddressesReturn => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải địa chỉ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (data: AddressFormData) => {
    const created = await createAddress(data);
    setAddresses((prev) => {
      const base = data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [...base, created];
    });
  }, []);

  const update = useCallback(async (id: string, data: AddressFormData) => {
    const updated = await updateAddress(id, data);
    setAddresses((prev) =>
      prev.map((a) => {
        if (data.isDefault && a.id !== id) return { ...a, isDefault: false };
        return a.id === id ? updated : a;
      }),
    );
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const setDefault = useCallback(async (id: string) => {
    const updated = await setDefaultAddress(id);
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? updated : { ...a, isDefault: false })),
    );
  }, []);

  return { addresses, isLoading, error, add, update, remove, setDefault, reload: load };
};
