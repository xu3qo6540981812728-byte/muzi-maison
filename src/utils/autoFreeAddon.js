/**
 * 主商品「送加購額度」(providesFreeAddon) 時，自動同步加購品數量。
 * - 主商品增加：附贈額度提高，加購品至少補到新的附贈件數（客戶可手動減少）
 * - 主商品減少：只減少「附贈額度」對應的件數，保留客戶自費加購的件數
 * - 手動增加加購：尚有免費額度時優先計入免費，超出部分計原價
 */

/** @param {Record<string, unknown>} mainProduct */
/** @param {Array<Record<string, unknown>>} allProducts */
export function getLinkedAddonIds(mainProduct, allProducts) {
  const raw = mainProduct?.freeAddonProductIds
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((id) => String(id || '').trim().toUpperCase())
      .filter(Boolean)
  }
  return (allProducts || [])
    .filter((p) => p && p.isAddon && p.id)
    .map((p) => p.id)
}

/** @param {string} raw */
export function parseFreeAddonProductIds(raw) {
  if (!raw || !String(raw).trim()) return []
  return String(raw)
    .split(/[;；,、]/)
    .map((id) => id.trim().toUpperCase())
    .filter(Boolean)
}

/** @param {string[]} ids */
export function formatFreeAddonProductIdsForCsv(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return ''
  return ids.join(';')
}

/** @param {Record<string, number>} cart */
/** @param {Array<Record<string, unknown>>} products */
export function computeAutoAddonTargets(cart, products) {
  const targets = {}
  Object.entries(cart || {}).forEach(([mainId, qtyRaw]) => {
    const q = Number(qtyRaw) || 0
    if (q <= 0) return
    const main = (products || []).find((p) => p.id === mainId)
    if (!main || main.isAddon || !main.providesFreeAddon) return
    getLinkedAddonIds(main, products).forEach((addonId) => {
      targets[addonId] = (targets[addonId] || 0) + q
    })
  })
  return targets
}

export function collectAllLinkedAddonIds(products) {
  const ids = new Set()
  ;(products || []).forEach((p) => {
    if (!p?.providesFreeAddon) return
    getLinkedAddonIds(p, products).forEach((id) => ids.add(id))
  })
  return ids
}

function countMainAndAddonQty(cart, products, excludeAddonId = null) {
  let mainQty = 0
  let addonQty = 0
  Object.entries(cart || {}).forEach(([cartId, qty]) => {
    const p = (products || []).find((item) => item.id === cartId)
    if (!p) return
    const q = Number(qty) || 0
    if (p.isAddon) {
      if (cartId !== excludeAddonId) addonQty += q
    } else {
      mainQty += q
    }
  })
  return { mainQty, addonQty }
}

/**
 * @param {Record<string, number>} cart
 * @param {Record<string, number>} addonFree
 * @param {Record<string, number>} prevCart
 * @param {Array<Record<string, unknown>>} products
 */
export function syncCartWithFreeAddons(cart, addonFree, prevCart, products) {
  const prevTargets = computeAutoAddonTargets(prevCart, products)
  const newTargets = computeAutoAddonTargets(cart, products)
  const linkedIds = collectAllLinkedAddonIds(products)
  const nextCart = { ...cart }
  const nextFree = { ...addonFree }

  linkedIds.forEach((addonId) => {
    const target = newTargets[addonId] || 0
    const prevTarget = prevTargets[addonId] || 0
    const total = nextCart[addonId] || 0
    let free = Math.min(nextFree[addonId] || 0, total)
    const paid = Math.max(0, total - free)

    if (target > prevTarget) {
      const newFree = Math.max(free, target)
      const newTotal = paid + newFree
      if (newTotal > 0) {
        nextCart[addonId] = newTotal
        nextFree[addonId] = newFree
      }
    } else if (target < prevTarget || free > target) {
      const newFree = Math.min(free, target)
      const newTotal = paid + newFree
      if (newTotal <= 0) {
        delete nextCart[addonId]
        delete nextFree[addonId]
      } else {
        nextCart[addonId] = newTotal
        nextFree[addonId] = newFree
      }
    } else if (target > 0 && total === 0) {
      nextCart[addonId] = target
      nextFree[addonId] = target
    }
  })

  return { cart: nextCart, addonFree: nextFree }
}

/**
 * @param {Record<string, number>} prevCart
 * @param {Record<string, number>} prevAddonFree
 * @param {string} id
 * @param {number} delta
 * @param {Array<Record<string, unknown>>} products
 */
export function applyCartDelta(prevCart, prevAddonFree, id, delta, products) {
  const product = (products || []).find((p) => p.id === id)
  let cart = { ...prevCart }
  let addonFree = { ...prevAddonFree }
  const currentQty = cart[id] || 0
  let newQty = currentQty + delta

  if (newQty <= 0) {
    const nextCart = { ...cart }
    delete nextCart[id]
    const nextFree = { ...addonFree }
    delete nextFree[id]
    if (product && !product.isAddon) {
      const synced = syncCartWithFreeAddons(nextCart, nextFree, prevCart, products)
      return { cart: synced.cart, addonFree: synced.addonFree }
    }
    return { cart: nextCart, addonFree: nextFree }
  }

  if (delta > 0 && product?.isAddon) {
    const { mainQty, addonQty } = countMainAndAddonQty(cart, products, id)
    if (addonQty + newQty > mainQty) {
      return {
        cart: prevCart,
        addonFree: prevAddonFree,
        blocked: true,
        message: '加購品的總數不能大於主商品的總數喔！'
      }
    }
    const targets = computeAutoAddonTargets(cart, products)
    const maxFree = targets[id] || 0
    const curFree = Math.min(addonFree[id] || 0, currentQty)
    const remainingFree = Math.max(0, maxFree - curFree)
    const addFree = Math.min(delta, remainingFree)
    cart[id] = newQty
    if (addFree > 0) {
      addonFree[id] = curFree + addFree
    }
    return { cart, addonFree }
  }

  if (delta < 0 && product?.isAddon) {
    cart[id] = newQty
    const free = Math.min(addonFree[id] || 0, currentQty)
    if (free > 0) {
      const nextFree = Math.max(0, free + delta)
      if (nextFree > 0) addonFree[id] = nextFree
      else delete addonFree[id]
    }
    return { cart, addonFree }
  }

  cart[id] = newQty

  if (product && !product.isAddon) {
    const synced = syncCartWithFreeAddons(cart, addonFree, prevCart, products)
    cart = synced.cart
    addonFree = synced.addonFree

    const { addonQty } = countMainAndAddonQty(cart, products)
    let newMainQty = 0
    Object.entries(cart).forEach(([cartId, qty]) => {
      const p = (products || []).find((item) => item.id === cartId)
      if (p && !p.isAddon) newMainQty += Number(qty) || 0
    })
    if (addonQty > newMainQty) {
      return {
        cart: prevCart,
        addonFree: prevAddonFree,
        blocked: true,
        message: '加購品的總數不能大於主商品的總數喔！'
      }
    }
  }

  return { cart, addonFree }
}
