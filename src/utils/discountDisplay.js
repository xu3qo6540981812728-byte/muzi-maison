/**
 * 依訂單 totals（含選填之 promoBundle*）產生活動折抵標題與說明。
 * 舊訂單無 promo 欄位時仍會回落為泛用「活動折抵」。
 */
export function getDiscountDisplay(totals) {
  const amt = Number(totals?.discountAmount) || 0
  if (amt <= 0) return null

  const qty = totals.promoBundleQty
  const price = totals.promoBundlePrice
  const sets = totals.promoBundleSets

  if (
    qty != null &&
    price != null &&
    sets != null &&
    Number(sets) >= 1
  ) {
    return {
      title: '任選優惠（指定商品）',
      detail: `指定商品任選 ${qty} 件優惠價 $${price}｜本次套用 ${sets} 組`
    }
  }

  return {
    title: '活動折抵',
    detail: '含指定商品組合計價與其他試算差異'
  }
}

/** 列印 PDF 用：折抵區塊 HTML（已含金額列） */
export function getDiscountPdfBlockHtml(totals) {
  const d = getDiscountDisplay(totals)
  if (!d) return ''
  const detailPart = d.detail
    ? `<div style="font-size: 0.75em; color: #64748b; margin-top: 4px; text-align: right; line-height: 1.35;">${d.detail}</div>`
    : ''
  return `
    <div style="margin-bottom: 8px; color: #e11d48;">
      <div style="display: flex; justify-content: flex-end; gap: 20px;">
        <span>${d.title}</span>
        <span>-$${totals.discountAmount}</span>
      </div>
      ${detailPart}
    </div>
  `
}
