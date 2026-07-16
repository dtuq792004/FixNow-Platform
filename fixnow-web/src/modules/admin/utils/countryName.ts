// Mã ISO alpha-2 → tên quốc gia tiếng Việt. KHÔNG dùng emoji cờ (không hiển thị
// đúng trên máy Windows). Mã lạ → giữ nguyên; "Unknown"/rỗng → "Không xác định".
const NAMES: Record<string, string> = {
  VN: 'Việt Nam',
  US: 'Hoa Kỳ',
  JP: 'Nhật Bản',
  KR: 'Hàn Quốc',
  CN: 'Trung Quốc',
  TH: 'Thái Lan',
  SG: 'Singapore',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  IN: 'Ấn Độ',
  GB: 'Anh',
  FR: 'Pháp',
  DE: 'Đức',
  AU: 'Úc',
  CA: 'Canada',
  TW: 'Đài Loan',
  HK: 'Hồng Kông',
  RU: 'Nga',
  BR: 'Brazil',
}

export const countryName = (code: string): string => {
  if (!code || code === 'Unknown') return 'Không xác định'
  return NAMES[code] || code
}
