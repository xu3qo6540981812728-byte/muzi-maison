import assert from 'node:assert/strict'
import { applyCartDelta } from '../src/utils/autoFreeAddon.js'

const products = [
  { id: 'M1', isAddon: false, providesFreeAddon: true },
  { id: 'M2', isAddon: false, providesFreeAddon: false },
  { id: 'A1', isAddon: true, price: 50 }
]

// 主商品 5 件 → 自動附贈加購 5；客戶自費 +2；主商品改 4 → 加購應為 6（4 免費 + 2 自費）
{
  let cart = {}
  let free = {}
  let r = applyCartDelta(cart, free, 'M1', 5, products)
  cart = r.cart
  free = r.addonFree
  assert.equal(cart.M1, 5)
  assert.equal(cart.A1, 5, 'auto free addon qty')
  assert.equal(free.A1, 5)

  r = applyCartDelta(cart, free, 'M2', 2, products)
  cart = r.cart
  free = r.addonFree

  r = applyCartDelta(cart, free, 'A1', 2, products)
  cart = r.cart
  free = r.addonFree
  assert.equal(cart.A1, 7)
  assert.equal(free.A1, 5)

  r = applyCartDelta(cart, free, 'M1', -1, products)
  cart = r.cart
  free = r.addonFree
  assert.equal(cart.M1, 4)
  assert.equal(cart.A1, 6, 'paid addon preserved when main gift qty drops')
  assert.equal(free.A1, 4)
}

// 手動加購：尚有免費額度時優先免費；額度用盡後才計原價
{
  let cart = { M1: 2, M2: 1 }
  let free = {}
  let r = applyCartDelta(cart, free, 'A1', 1, products)
  assert.equal(r.cart.A1, 1)
  assert.equal(r.addonFree.A1, 1)

  r = applyCartDelta(r.cart, r.addonFree, 'A1', 1, products)
  assert.equal(r.cart.A1, 2)
  assert.equal(r.addonFree.A1, 2)

  r = applyCartDelta(r.cart, r.addonFree, 'A1', 1, products)
  assert.equal(r.cart.A1, 3)
  assert.equal(r.addonFree.A1, 2)
  assert.equal(r.cart.A1 - r.addonFree.A1, 1)
}

console.log('autoFreeAddon.test.mjs: all passed')
