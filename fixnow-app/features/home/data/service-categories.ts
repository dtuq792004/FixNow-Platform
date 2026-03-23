import type { ServiceCategoryConfig, ServiceCategoryType } from '../types';

/**
 * Hardcoded categories — mirrors exact MongoDB documents in DB.
 * _id: ObjectId dùng khi gọi API (createRequest, filterService, v.v.)
 * Cập nhật khi admin thêm/sửa categories.
 */
export const SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  {
    _id: '69bc03e8a25fb3da39ef8678',
    type: 'electrical',
    label: 'Điện',
    description: 'Điện dân dung, đèn, ổ cắm',
    icon: 'zap',
    bgClass: 'bg-amber-100',
    iconColor: '#D97706',
  },
  {
    _id: '69bc041ea25fb3da39ef867a',
    type: 'plumbing',
    label: 'Nước',
    description: 'Ống nước, vòi, bồn rửa',
    icon: 'droplet',
    bgClass: 'bg-blue-100',
    iconColor: '#2563EB',
  },
  {
    _id: '69bc0781a25fb3da39ef8682',
    type: 'hvac',
    label: 'Điện lạnh',
    description: 'Máy lạnh, điều hòa, quạt',
    icon: 'wind',
    bgClass: 'bg-cyan-100',
    iconColor: '#0891B2',
  },
  {
    _id: '69bc07c7a25fb3da39ef8684',
    type: 'appliance',
    label: 'Thiết bị',
    description: 'Tủ lạnh, máy giặt, TV',
    icon: 'settings',
    bgClass: 'bg-orange-100',
    iconColor: '#EA580C',
  },
  {
    _id: '69bc04caa25fb3da39ef867c',
    type: 'security',
    label: 'Khóa cửa',
    description: 'Khóa, cửa, bảo mật',
    icon: 'lock',
    bgClass: 'bg-slate-100',
    iconColor: '#475569',
  },
  {
    _id: '69bc04eea25fb3da39ef867e',
    type: 'painting',
    label: 'Sơn sửa',
    description: 'Sơn tường, trần, nội thất',
    icon: 'edit-2',
    bgClass: 'bg-violet-100',
    iconColor: '#7C3AED',
  },
];

export const OTHER_CATEGORY: ServiceCategoryConfig = {
  _id: '69bc0503a25fb3da39ef8680',
  type: 'other',
  label: 'Khác',
  description: 'Dịch vụ sửa chữa khác',
  icon: 'tool',
  bgClass: 'bg-gray-100',
  iconColor: '#6B7280',
};

export const getCategoryConfig = (type: string): ServiceCategoryConfig =>
  SERVICE_CATEGORIES.find((c) => c.type === type) ??
  (type === 'other' ? OTHER_CATEGORY : OTHER_CATEGORY);

export const getCategoryById = (id: string): ServiceCategoryConfig | undefined =>
  [...SERVICE_CATEGORIES, OTHER_CATEGORY].find((c) => c._id === id);
