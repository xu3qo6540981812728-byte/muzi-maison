import { getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import {
  calculateOrderTotals,
  mergeStoreConfig
} from './orderPricing.mjs'

if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()

const roundMoney = (n) => Math.round(Number(n) || 0)

/**
 * 訂單建立後：依 Firestore 商品價與 pricingSnapshot／設定重算，寫入 priceAudit。
 * 與前端試算邏輯同源（orderPricing.mjs），請於修改計價後執行 npm run sync-pricing。
 */
export const auditOrderPricing = onDocumentCreated(
  {
    document: 'orders/{orderId}',
    region: 'asia-east1'
  },
  async (event) => {
    const snap = event.data
    if (!snap) return

    const order = snap.data()
    const ref = snap.ref

    const items = order.items
    if (!Array.isArray(items) || items.length === 0) {
      await ref.update({
        priceAudit: {
          status: 'skipped',
          reason: 'no_items',
          checkedAt: FieldValue.serverTimestamp()
        }
      })
      return
    }

    try {
      const deliveryMethod = order.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'
      const adminDiscount = roundMoney(order.adminDiscount)

      const configSnap = await db.doc('settings/config').get()
      const liveConfig = configSnap.exists ? configSnap.data() || {} : {}
      const storeConfig = mergeStoreConfig({
        ...liveConfig,
        ...(order.pricingSnapshot && typeof order.pricingSnapshot === 'object' ? order.pricingSnapshot : {})
      })

      const ids = new Set()
      for (const line of items) {
        if (line?.isGift) continue
        const id = String(line?.id || '').trim()
        if (id) ids.add(id)
      }

      if (ids.size === 0) {
        await ref.update({
          priceAudit: {
            status: 'error',
            reason: 'no_line_ids',
            checkedAt: FieldValue.serverTimestamp()
          }
        })
        return
      }

      const productMap = new Map()
      await Promise.all(
        [...ids].map(async (pid) => {
          const doc = await db.collection('products').doc(pid).get()
          if (doc.exists) {
            productMap.set(pid, { id: doc.id, ...doc.data() })
          }
        })
      )

      const clean = []
      let missingId = null
      for (const line of items) {
        if (line?.isGift) continue
        const pid = String(line?.id || '').trim()
        if (!pid) {
          missingId = 'empty_id'
          break
        }
        const p = productMap.get(pid)
        if (!p) {
          missingId = pid
          break
        }
        clean.push({
          ...p,
          qty: Number(line.qty) || 0,
          ...(line.groupSplitLabel ? { groupSplitLabel: line.groupSplitLabel } : {})
        })
      }

      if (missingId) {
        await ref.update({
          priceAudit: {
            status: 'error',
            reason: 'missing_product',
            missingProductId: missingId,
            checkedAt: FieldValue.serverTimestamp()
          }
        })
        return
      }

      const calc = calculateOrderTotals(clean, deliveryMethod, storeConfig)

      const serverFinalBeforeDiscount = roundMoney(calc.finalPrice)
      const expectedFinal = serverFinalBeforeDiscount - adminDiscount

      const cItemsBase = roundMoney(order.totals?.itemsBaseTotal)
      const cDisc = roundMoney(order.totals?.discountAmount)
      const cShip = roundMoney(order.totals?.shippingFee)
      const cFinal = roundMoney(order.totals?.finalPrice)

      const sItemsBase = roundMoney(calc.itemsBaseTotal)
      const sDisc = roundMoney(calc.discountAmount)
      const sShip = roundMoney(calc.shippingFee)

      const diffs = []
      if (cItemsBase !== sItemsBase) {
        diffs.push({ field: 'itemsBaseTotal', client: cItemsBase, server: sItemsBase })
      }
      if (cDisc !== sDisc) {
        diffs.push({ field: 'discountAmount', client: cDisc, server: sDisc })
      }
      if (cShip !== sShip) {
        diffs.push({ field: 'shippingFee', client: cShip, server: sShip })
      }
      if (cFinal !== expectedFinal) {
        diffs.push({ field: 'finalPrice', client: cFinal, server: expectedFinal })
      }

      const status = diffs.length === 0 ? 'ok' : 'mismatch'

      await ref.update({
        priceAudit: {
          status,
          checkedAt: FieldValue.serverTimestamp(),
          expectedFinal,
          serverTotals: {
            itemsBaseTotal: sItemsBase,
            discountAmount: sDisc,
            shippingFee: sShip,
            finalPriceBeforeAdminDiscount: serverFinalBeforeDiscount
          },
          ...(diffs.length ? { diffs } : {})
        }
      })
    } catch (e) {
      console.error('auditOrderPricing', event.params?.orderId, e)
      await ref.update({
        priceAudit: {
          status: 'error',
          reason: 'audit_exception',
          message: String(e?.message || e).slice(0, 500),
          checkedAt: FieldValue.serverTimestamp()
        }
      })
    }
  }
)
