/**
 * 訂單金額試算（與結帳邏輯同源，供前端與 Cloud Functions 審計共用）。
 * 若修改計價規則，請執行 `npm run sync-pricing` 再部署 functions。
 */

export const DEFAULT_STORE_CONFIG = {
  shippingFee: 100,
  freeShippingThreshold: 2000,
  promoQty: 3,
  promoPrice: 550,
  wholesaleThreshold: 12,
  freeAddonReminderMsg:
    '恭喜！您選購的主商品享有「0元加購」優惠！\n別忘了至下方加購專區挑選喔！',
  giftThreshold: 30,
  giftProductId: ''
}

export function mergeStoreConfig(partial) {
  return { ...DEFAULT_STORE_CONFIG, ...(partial && typeof partial === 'object' ? partial : {}) }
}

/**
 * @param {Array<Record<string, unknown>>} itemsList
 * @param {'delivery'|'pickup'|string} deliveryWay
 * @param {Record<string, unknown>} storeConfig
 * @returns {{
 *   items: Array<Record<string, unknown>>,
 *   totalQty: number,
 *   freeShippingQty: number,
 *   currentTotal: number,
 *   finalPrice: number,
 *   shippingFee: number,
 *   discountAmount: number,
 *   itemsBaseTotal: number,
 *   totalCost: number,
 *   giftCount: number,
 *   appliedGiftId: string,
 *   promoBundleQty: number,
 *   promoBundlePrice: number,
 *   promoBundleSets: number
 * }}
 */
export function calculateOrderTotals(itemsList, deliveryWay, storeConfig) {
  const cfg = mergeStoreConfig(storeConfig)
  const rawBundleQty = Math.floor(Number(cfg.promoQty))
  const promoQtySafe = Math.max(1, rawBundleQty || 1)

  const lines = (itemsList || []).map((i) => ({ ...i }))

  let totalQty = 0
  let nonPromoPrice = 0
  const promoItemsExpanded = []
  let totalCost = 0
  let freeShippingQty = 0
  let mainProductQty = 0
  let giftCount = 0
  let appliedGiftId = ''

  let freeAddonQuota = 0
  lines.forEach((item) => {
    if (!item.isAddon && item.providesFreeAddon) {
      freeAddonQuota += Number(item.qty) || 0
    }
  })

  const hasExplicitAddonFree = lines.some(
    (item) => item.isAddon && item.freeQty != null && item.freeQty !== ''
  )

  let itemsBaseTotal = 0

  lines.forEach((item) => {
    const q = Number(item.qty) || 0
    totalQty += q
    totalCost += (Number(item.cost) || 0) * q
    if (item.isFreeShipping !== false) {
      freeShippingQty += q
    }

    if (item.isAddon) {
      let freeCount
      let paidCount
      if (hasExplicitAddonFree) {
        freeCount = Math.min(q, Math.max(0, Number(item.freeQty) || 0))
        paidCount = Math.max(0, q - freeCount)
      } else {
        freeCount = Math.min(q, freeAddonQuota)
        paidCount = q - freeCount
        freeAddonQuota -= freeCount
      }

      item.freeQty = freeCount
      item.paidQty = paidCount
      const unit = Number(item.price) || 0
      item.subtotal = paidCount * unit

      nonPromoPrice += item.subtotal
      itemsBaseTotal += item.subtotal
    } else {
      const unit = Number(item.price) || 0
      item.subtotal = unit * q
      itemsBaseTotal += item.subtotal
      mainProductQty += q
      if (item.isPromo) {
        for (let i = 0; i < q; i++) promoItemsExpanded.push(unit)
      } else {
        nonPromoPrice += item.subtotal
      }
    }
  })

  promoItemsExpanded.sort((a, b) => b - a)
  const promoSets = Math.floor(promoItemsExpanded.length / promoQtySafe)
  const promoTotal = promoSets * (Number(cfg.promoPrice) || 0)
  let remainderTotal = 0
  for (let i = promoSets * promoQtySafe; i < promoItemsExpanded.length; i++) {
    remainderTotal += promoItemsExpanded[i]
  }

  const currentTotal = nonPromoPrice + promoTotal + remainderTotal
  const discountAmount = itemsBaseTotal - currentTotal

  const gt = Number(cfg.giftThreshold) || 0
  const gid = String(cfg.giftProductId || '').trim()
  if (gt > 0 && gid) {
    giftCount = Math.floor(mainProductQty / gt)
    if (giftCount > 0) appliedGiftId = gid
  }

  let shippingFee = 0
  const threshold = Number(cfg.freeShippingThreshold) || 0
  if (deliveryWay === 'delivery' && currentTotal < threshold) {
    shippingFee = Number(cfg.shippingFee) || 0
  }
  const finalPrice = currentTotal + shippingFee

  return {
    items: lines,
    totalQty,
    freeShippingQty,
    currentTotal,
    finalPrice,
    shippingFee,
    discountAmount,
    itemsBaseTotal,
    totalCost,
    giftCount,
    appliedGiftId,
    promoBundleQty: rawBundleQty >= 1 ? rawBundleQty : promoQtySafe,
    promoBundlePrice: Number(cfg.promoPrice) || 0,
    promoBundleSets: promoSets
  }
}

/**
 * 與原 cartData 一致：試算後將滿件贈品列 append（不影響 totals 數字）。
 */
export function appendGiftLinesToCart(items, totals, products) {
  const list = [...items]
  if (totals.giftCount > 0 && totals.appliedGiftId) {
    const giftProduct = (products || []).find((p) => p.id === totals.appliedGiftId)
    if (giftProduct) {
      list.push({
        ...giftProduct,
        isGift: true,
        qty: totals.giftCount,
        subtotal: 0,
        price: 0
      })
    }
  }
  return list
}

/** 結帳當下寫入訂單，供審計還原促銷參數（避免日後改設定誤判舊單）。 */
export function buildPricingSnapshot(storeConfig) {
  const c = mergeStoreConfig(storeConfig)
  return {
    shippingFee: Number(c.shippingFee) || 0,
    freeShippingThreshold: Number(c.freeShippingThreshold) || 0,
    promoQty: Math.max(1, Math.floor(Number(c.promoQty)) || 1),
    promoPrice: Number(c.promoPrice) || 0,
    giftThreshold: Number(c.giftThreshold) || 0,
    giftProductId: String(c.giftProductId || '').trim()
  }
}

/** 審計時：pricingSnapshot 與預設合併為 storeConfig 片段 */
export function storeConfigFromPricingSnapshot(snapshot) {
  return mergeStoreConfig(snapshot || {})
}
