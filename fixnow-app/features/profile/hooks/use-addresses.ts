import { useCallback, useState } from 'react';
import { MOCK_SAVED_ADDRESSES } from '../data/mock-addresses';
import type { SavedAddress } from '../types';

let _addresses = [...MOCK_SAVED_ADDRESSES]; // module-level mock store

/**
 * Manages saved addresses locally.
 * Replace with real API calls when backend is ready.
 */
export const useAddresses = () => {
  const [addresses, setAddresses] = useState<SavedAddress[]>(_addresses);

  const add = useCallback((data: Omit<SavedAddress, 'id'>) => {
    const newItem: SavedAddress = { ...data, id: `addr-${Date.now()}` };
    // If new address is default, unset others
    const updated = data.isDefault
      ? [...addresses.map((a) => ({ ...a, isDefault: false })), newItem]
      : [...addresses, newItem];
    _addresses = updated;
    setAddresses(updated);
  }, [addresses]);

  const update = useCallback((id: string, data: Omit<SavedAddress, 'id'>) => {
    const updated = addresses.map((a) => {
      if (data.isDefault && a.id !== id) return { ...a, isDefault: false };
      return a.id === id ? { ...a, ...data } : a;
    });
    _addresses = updated;
    setAddresses(updated);
  }, [addresses]);

  const remove = useCallback((id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    _addresses = updated;
    setAddresses(updated);
  }, [addresses]);

  const setDefault = useCallback((id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    _addresses = updated;
    setAddresses(updated);
  }, [addresses]);

  return { addresses, add, update, remove, setDefault };
};
