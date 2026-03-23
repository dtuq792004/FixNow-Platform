import type { ServiceCategoryConfig } from '../types';

export const SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  {
    type: 'electrical',
    label: 'Điện',
    icon: 'zap',
    bgClass: 'bg-amber-100',
    iconColor: '#D97706',
  },
  {
    type: 'plumbing',
    label: 'Nước',
    icon: 'droplet',
    bgClass: 'bg-blue-100',
    iconColor: '#2563EB',
  },
  {
    type: 'hvac',
    label: 'Điện lạnh',
    icon: 'wind',
    bgClass: 'bg-cyan-100',
    iconColor: '#0891B2',
  },
  {
    type: 'appliance',
    label: 'Thiết bị',
    icon: 'settings',
    bgClass: 'bg-orange-100',
    iconColor: '#EA580C',
  },
  {
    type: 'security',
    label: 'Khóa cửa',
    icon: 'lock',
    bgClass: 'bg-slate-100',
    iconColor: '#475569',
  },
  {
    type: 'painting',
    label: 'Sơn sửa',
    icon: 'edit-2',
    bgClass: 'bg-violet-100',
    iconColor: '#7C3AED',
  },
];

export const getCategoryConfig = (type: string): ServiceCategoryConfig =>
  SERVICE_CATEGORIES.find((c) => c.type === type) ?? {
    type: 'other',
    label: 'Khác',
    icon: 'tool',
    bgClass: 'bg-gray-100',
    iconColor: '#6B7280',
  };
