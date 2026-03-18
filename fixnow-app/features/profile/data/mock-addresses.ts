import type { SavedAddress } from '../types';

export const MOCK_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'home',
    street: '123 Nguyễn Trãi, Phường 2',
    district: 'Quận 5',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'work',
    street: '45 Lê Lợi, Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
  },
];
