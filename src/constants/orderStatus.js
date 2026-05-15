export const STATUS_MAP = {
  pending: { label: '未處理（舊）', color: 'bg-rose-100 text-rose-700' },
  confirming: { label: '待付款確認', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: '已付款確認訂單', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: '出貨中', color: 'bg-violet-100 text-violet-700' },
  shipped: { label: '已出貨', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
  cancel_requested: { label: '買方申請取消', color: 'bg-orange-100 text-orange-700' },
  cancelled: { label: '已取消', color: 'bg-stone-200 text-stone-600' }
}

export const PAID_STATUSES = ['confirmed', 'shipping', 'shipped', 'completed']

/** 客戶仍可申請取消的狀態（含舊 pending） */
export const CANCELLABLE_ORDER_STATUSES = ['pending', 'confirming']

/** 尚未完成付款確認（待辦） */
export const AWAITING_PAYMENT_STATUSES = ['pending', 'confirming']

export function isAwaitingPayment(status) {
  return AWAITING_PAYMENT_STATUSES.includes(status)
}

export function isCancellableOrderStatus(status) {
  return CANCELLABLE_ORDER_STATUSES.includes(status)
}
