/** 付款改由官方 LINE 提供匯款／LINE Pay 資訊（網站不顯示帳號） */

export const LINE_PAYMENT_REMINDER =
  '請直接加官方 LINE，並提供訂單明細，我們會提供匯款帳號。（可 LINE Pay）'

export const LINE_PAYMENT_REMINDER_SHORT =
  '下單後請複製明細並至官方 LINE 傳送，我們會提供匯款帳號。（可 LINE Pay）'

export function buildOrderLineReportText(order) {
  let text = `*【木子家 MUZI MAISON 新訂單】*\n\n訂單編號：${order.id}\n訂購人：${order.customerInfo.name}\n聯絡電話：${order.customerInfo.phone}\n取貨方式：${order.deliveryMethod === 'delivery' ? '宅配' : '自取'}\n地址：${order.customerInfo.address}\n----------------------\n`
  order.items.forEach((item) => {
    const splitTag = item.groupSplitLabel ? `（${item.groupSplitLabel}）` : ''
    text += `▪️ ${item.name} ${item.weight ? `(${item.weight})` : ''}${splitTag} x ${item.qty} ${item.unit || ''}\n`
  })
  text += `----------------------\n`
  if (order.adminDiscount > 0) text += `*手動折扣*：-$${order.adminDiscount}\n`
  text += `*總計金額：$${order.totals.finalPrice}*\n`
  if (order.orderNote) text += `*備註事項*：${order.orderNote}\n`
  return text
}
