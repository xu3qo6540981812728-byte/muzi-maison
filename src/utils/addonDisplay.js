/**
 * 加購品附贈／自費顯示（購物車、訂單、出貨單、管理介面共用）
 */

export function getAddonQtyBreakdown(item) {
  const qty = Number(item?.qty) || 0
  if (!item?.isAddon || qty <= 0) {
    return { qty, freeQty: 0, paidQty: 0 }
  }
  const freeQty = Math.min(qty, Math.max(0, Number(item.freeQty) || 0))
  const paidQty =
    item.paidQty != null && item.paidQty !== ''
      ? Math.max(0, Number(item.paidQty) || 0)
      : Math.max(0, qty - freeQty)
  return { qty, freeQty, paidQty }
}

/** 數量說明，例如「內含 4 件主商品附贈，另 2 件自費」 */
export function formatAddonQtyNote(item) {
  const { freeQty, paidQty } = getAddonQtyBreakdown(item)
  if (!item?.isAddon) return ''
  const parts = []
  if (freeQty > 0) parts.push(`內含 ${freeQty} 件主商品附贈`)
  if (paidQty > 0) parts.push(`另 ${paidQty} 件自費`)
  return parts.join('，')
}

/** 單價括號內文字，例如「4件$0（主商品附贈）, 2件$120」 */
export function formatAddonPriceHint(item) {
  const { qty, freeQty, paidQty } = getAddonQtyBreakdown(item)
  if (!item?.isAddon || qty <= 0) return null
  const unit = Number(item.price) || 0
  if (freeQty > 0 && paidQty > 0) {
    return `${freeQty}件$0（主商品附贈）, ${paidQty}件$${unit}`
  }
  if (freeQty > 0) {
    return `${freeQty}件$0（主商品附贈）`
  }
  if (item.subtotal === 0 && qty > 0) return '0'
  return `$${unit}`
}
