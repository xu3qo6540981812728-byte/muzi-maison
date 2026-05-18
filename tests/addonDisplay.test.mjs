import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatAddonPriceHint, formatAddonQtyNote } from '../src/utils/addonDisplay.js'

describe('addonDisplay', () => {
  it('shows free and paid parts', () => {
    const item = { isAddon: true, qty: 6, freeQty: 4, paidQty: 2, price: 50, subtotal: 100 }
    assert.equal(formatAddonQtyNote(item), '內含 4 件主商品附贈，另 2 件自費')
    assert.equal(formatAddonPriceHint(item), '4件$0（主商品附贈）, 2件$50')
  })

  it('shows all-free addon', () => {
    const item = { isAddon: true, qty: 4, freeQty: 4, paidQty: 0, price: 50, subtotal: 0 }
    assert.equal(formatAddonQtyNote(item), '內含 4 件主商品附贈')
    assert.equal(formatAddonPriceHint(item), '4件$0（主商品附贈）')
  })
})
