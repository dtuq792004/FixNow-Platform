import type { SavedAddress } from '../types';

export const MOCK_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'home',
    addressLine: '123 Nguyễn Trãi',
    ward: 'Phường 2',
    district: 'Quận 5',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'work',
    addressLine: '45 Lê Lợi',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
  },
];
