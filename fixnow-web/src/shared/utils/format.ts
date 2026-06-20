export function formatCurrency(value = 0) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

export function formatDateTime(value?: string) {
  if (!value) return 'Chưa xác định'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function getId(value: { _id?: string; id?: string } | string | null | undefined) {
  if (!value) return ''
  return typeof value === 'string' ? value : value._id ?? value.id ?? ''
}
