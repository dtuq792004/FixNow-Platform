export interface ProfileSettingItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
}

export const PROFILE_SETTINGS: ProfileSettingItem[] = [
  { id: 'personal', label: 'Thông tin cá nhân', description: 'Tên, email, số điện thoại', icon: 'user' },
  { id: 'address', label: 'Địa chỉ đã lưu', description: 'Quản lý địa chỉ thường dùng', icon: 'map-pin' },
  { id: 'notifications', label: 'Thông báo', description: 'Tuỳ chỉnh thông báo nhận được', icon: 'bell' },
  { id: 'language', label: 'Ngôn ngữ', description: 'Tiếng Việt', icon: 'globe' },
  { id: 'terms', label: 'Điều khoản & Chính sách', icon: 'file-text' },
  { id: 'help', label: 'Trợ giúp & Hỗ trợ', icon: 'help-circle' },
];
