/**
 * 邊界與促銷情境測試（與 LegacyApp 試算交叉比對用）。
 * 執行：npm run test:pricing
 */
import assert from 'node:assert/strict'
import {
  appendGiftLinesToCart,
  buildPricingSnapshot,
  calculateOrderTotals,
  mergeStoreConfig
} from '../src/shared/orderPricing.js'

const cfg = mergeStoreConfig({
  shippingFee: 100,
  freeShippingThreshold: 2000,
  promoQty: 3,
  promoPrice: 550,
  giftThreshold: 30,
  giftProductId: 'G1'
})

function P(over) {
  return { id: 'x', name: 't', price: 100, cost: 0, isAddon: false, isPromo: false, ...over }
}

// 1) 空購物車邊界
{
  const r = calculateOrderTotals([], 'delivery', cfg)
  assert.equal(r.currentTotal, 0)
  assert.equal(r.finalPrice, 100, '未滿免運應收運費')
  assert.equal(r.discountAmount, 0)
}

// 2) 免運門檻：剛好等於門檻不應收運費
{
  const items = [P({ id: 'A', price: 1000, qty: 2 })]
  const r = calculateOrderTotals(items, 'delivery', { ...cfg, freeShippingThreshold: 2000 })
  assert.equal(r.currentTotal, 2000)
  assert.equal(r.shippingFee, 0)
  assert.equal(r.finalPrice, 2000)
}

// 3) 免運門檻：差 1 元應收運費
{
  const items = [P({ id: 'A', price: 999, qty: 2 })]
  const r = calculateOrderTotals(items, 'delivery', { ...cfg, freeShippingThreshold: 2000 })
  assert.equal(r.currentTotal, 1998)
  assert.equal(r.shippingFee, 100)
  assert.equal(r.finalPrice, 2098)
}

// 4) 自取永遠不加運費（即使未滿免運門檻）
{
  const items = [P({ id: 'A', price: 100, qty: 1 })]
  const r = calculateOrderTotals(items, 'pickup', cfg)
  assert.equal(r.shippingFee, 0)
  assert.equal(r.finalPrice, r.currentTotal)
}

// 5) 任選促銷：3 件原價 600，組合價 550 → 折 50
{
  const items = [
    P({ id: 'p1', price: 200, qty: 1, isPromo: true }),
    P({ id: 'p2', price: 200, qty: 1, isPromo: true }),
    P({ id: 'p3', price: 200, qty: 1, isPromo: true })
  ]
  const r = calculateOrderTotals(items, 'delivery', { ...cfg, promoQty: 3, promoPrice: 550 })
  assert.equal(r.promoBundleSets, 1)
  assert.equal(r.currentTotal, 550)
  assert.equal(r.discountAmount, 50)
}

// 6) 加購 0 元額度：主商品 2 提供額度，加購 3 件只付 1 件
{
  const items = [
    P({ id: 'm', price: 300, qty: 2, providesFreeAddon: true, isAddon: false }),
    P({ id: 'a', price: 80, qty: 3, isAddon: true })
  ]
  const r = calculateOrderTotals(items, 'pickup', cfg)
  const addon = r.items.find((i) => i.id === 'a')
  assert.equal(addon.freeQty, 2)
  assert.equal(addon.paidQty, 1)
  assert.equal(addon.subtotal, 80)
  assert.equal(r.currentTotal, 300 * 2 + 80)
}

// 7) 滿件贈：主商品 60 件、門檻 30 → 2 個贈品；append 不影響 totals
{
  const items = [P({ id: 'm', price: 10, qty: 60, isAddon: false })]
  const r = calculateOrderTotals(items, 'pickup', { ...cfg, giftThreshold: 30, giftProductId: 'G1' })
  assert.equal(r.giftCount, 2)
  assert.equal(r.appliedGiftId, 'G1')
  const giftList = appendGiftLinesToCart(r.items, r, [{ id: 'G1', name: '贈', price: 999, isAddon: false }])
  assert.equal(giftList.filter((i) => i.isGift).length, 1)
  assert.equal(giftList.find((i) => i.isGift).qty, 2)
}

// 8) promoQty 非法 0：應以 1 安全除數，不拋錯
{
  const items = [P({ id: 'p', price: 100, qty: 1, isPromo: true })]
  const r = calculateOrderTotals(items, 'pickup', { ...cfg, promoQty: 0, promoPrice: 50 })
  assert.ok(r.promoBundleSets >= 0)
}

// 9) buildPricingSnapshot 含 giftProductId 大寫正規化由呼叫端處理；此處只測結構
{
  const s = buildPricingSnapshot(cfg)
  assert.equal(s.promoQty, 3)
  assert.equal(s.giftProductId, 'G1')
}

// 10) 促銷品 + 一般品同車
{
  const items = [
    P({ id: 'n', price: 400, qty: 1, isPromo: false }),
    P({ id: 'p', price: 100, qty: 2, isPromo: true })
  ]
  const r = calculateOrderTotals(items, 'pickup', { ...cfg, promoQty: 2, promoPrice: 150 })
  assert.equal(r.promoBundleSets, 1)
  assert.equal(r.currentTotal, 550, '400 + 兩件促銷組 150')
}

console.log('orderPricing.test.mjs: 全部通過（10 組邊界／促銷）')
