/** 管理員標記「已付款」時必填，供日後查帳 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'bank_transfer', label: '銀行匯款' },
  { value: 'line_pay', label: 'LINE Pay' },
  { value: 'cash', label: '現金' },
  { value: 'other', label: '其他' }
]

export function getPaymentMethodLabel(value) {
  if (!value) return ''
  return PAYMENT_METHOD_OPTIONS.find((o) => o.value === value)?.label || value
}
