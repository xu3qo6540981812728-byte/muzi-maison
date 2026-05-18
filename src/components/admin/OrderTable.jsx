import { Fragment, useEffect, useMemo, useState } from 'react'
import { Eye, Trash2, X } from '../Icons'
import { getDiscountDisplay } from '../../utils/discountDisplay'
import { formatAddonPriceHint, formatAddonQtyNote } from '../../utils/addonDisplay'
import { getPaymentMethodLabel } from '../../constants/paymentMethod'
import { PAID_STATUSES } from '../../constants/orderStatus'

function OrderDetailModal({
  order,
  onClose,
  statusMap,
  requestOrderStatusChange,
  deleteOrder,
  trackingInputs,
  setTrackingInputs,
  saveTrackingNumber,
  adminDiscountInputs,
  setAdminDiscountInputs,
  saveAdminDiscount,
  adminNoteInputs,
  setAdminNoteInputs,
  saveOrderNote
}) {
  if (!order) return null
  const isCancelReq = order.status === 'cancel_requested'

  return (
    <div
      className="fixed inset-0 z-[55] flex justify-center items-center bg-black/45 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`order-detail-${order.id}`}
    >
      <div className="bg-brand-marble rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-400 hover:bg-stone-100 p-1 rounded-full"
          aria-label="關閉"
        >
          <X size={22} />
        </button>
        <h3 id={`order-detail-${order.id}`} className="font-black text-stone-800 text-lg pr-10 mb-3 border-b border-stone-200 pb-2">
          購買明細 · {order.id}
        </h3>

        {order.priceAudit?.status === 'mismatch' && (
          <div className="mb-3 bg-rose-50 text-rose-800 text-xs font-bold p-3 rounded-lg border border-rose-300 space-y-1">
            <p>價格審計異常：伺服器試算與訂單金額不符，出貨前請務必人工核對。</p>
            {Array.isArray(order.priceAudit.diffs) && order.priceAudit.diffs.length > 0 && (
              <ul className="list-disc pl-4 text-[11px] font-mono">
                {order.priceAudit.diffs.map((d, idx) => (
                  <li key={idx}>
                    {d.field}：訂單 {d.client} vs 試算 {d.server}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {order.priceAudit?.status === 'error' && (
          <div className="mb-3 bg-orange-50 text-orange-800 text-xs font-bold p-3 rounded-lg border border-orange-200">
            價格審計未完成：{order.priceAudit.reason || 'error'}
            {order.priceAudit.missingProductId && `（缺商品：${order.priceAudit.missingProductId}）`}
          </div>
        )}
        {order.priceAudit?.status === 'ok' && (
          <div className="mb-3 bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-lg border border-emerald-200">
            價格審計：通過（伺服器依商品與促銷設定重算後，與本訂單金額一致）
            {order.priceAudit?.checkedAt?.toDate && (
              <span className="block mt-1 font-mono font-normal text-[11px] text-emerald-700">
                審計時間：{order.priceAudit.checkedAt.toDate().toLocaleString()}
              </span>
            )}
          </div>
        )}
        {order.priceAudit?.status === 'skipped' && (
          <div className="mb-3 bg-stone-100 text-stone-600 text-xs font-bold p-2 rounded-lg border border-stone-200">
            價格審計：略過（{order.priceAudit.reason === 'no_items' ? '無訂單明細' : order.priceAudit.reason || '略過'}）
          </div>
        )}

        {order.status === 'confirming' && (
          <div className="mb-3 bg-amber-50 text-amber-700 text-xs font-bold p-2 rounded-lg text-center border border-amber-200">
            等待客戶於 LINE 完成付款確認
          </div>
        )}
        {PAID_STATUSES.includes(order.status) && order.paymentMethod && (
          <div className="mb-3 bg-blue-50 text-blue-800 text-xs font-bold p-2 rounded-lg border border-blue-200">
            付款方式：{getPaymentMethodLabel(order.paymentMethod)}
            {order.paymentNote ? (
              <span className="block mt-1 font-normal text-blue-700">備註：{order.paymentNote}</span>
            ) : null}
          </div>
        )}

        {isCancelReq && (
          <div className="mb-3 bg-orange-50 text-orange-700 text-xs font-bold p-2 rounded-lg text-center border border-orange-200">
            買家已送出取消申請，請審核
          </div>
        )}

        {(order.status === 'shipping' || order.status === 'shipped') && (
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder={order.status === 'shipping' ? '物流單號（儲存後為已出貨）' : '物流單號'}
              value={trackingInputs[order.id] ?? order.trackingNumber ?? ''}
              onChange={(e) =>
                setTrackingInputs({
                  ...trackingInputs,
                  [order.id]: e.target.value
                })
              }
              className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-purple-400 font-bold"
            />
            <button
              type="button"
              onClick={() => saveTrackingNumber(order.id)}
              className="bg-purple-100 text-purple-700 text-xs font-bold px-3 rounded-lg hover:bg-purple-200 transition-colors shrink-0"
            >
              儲存
            </button>
          </div>
        )}

        <div className="text-xs text-stone-600 space-y-2 mb-4">
          <p className="font-bold text-stone-500 border-b border-stone-200 pb-1">品項</p>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-2 items-start border-b border-stone-100 pb-2 last:border-0">
              <span className="min-w-0">
                {item.name}{' '}
                {item.groupSplitLabel && (
                  <span className="text-[10px] text-indigo-600 font-bold">（{item.groupSplitLabel}）</span>
                )}{' '}
                {item.weight && (
                  <span className="text-[10px] text-stone-500">({item.weight})</span>
                )}{' '}
                {item.isAddon && (
                  <span className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded">加購</span>
                )}{' '}
                {item.isGift && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1 rounded font-bold">滿件贈品</span>
                )}{' '}
                <span className="text-stone-400 text-[10px]">
                  (
                  {formatAddonPriceHint(item) ??
                    (item.subtotal === 0 ? '0' : item.price)}
                  )
                </span>
                {item.isAddon && formatAddonQtyNote(item) ? (
                  <span className="block text-[10px] text-blue-700 font-bold mt-0.5">
                    {formatAddonQtyNote(item)}
                  </span>
                ) : null}
              </span>
              <span className="font-bold shrink-0">
                ×{item.qty} {item.unit || ''}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-4 border-t border-stone-200 pt-3">
          <span className="text-xs font-bold text-stone-500">狀態</span>
          <select
            value={order.status || 'confirming'}
            onChange={(e) => requestOrderStatusChange(order, e.target.value)}
            className={`text-xs font-bold outline-none rounded p-1.5 cursor-pointer shadow-sm border border-stone-200 ${
              statusMap?.[order.status]?.color || 'bg-stone-100 text-stone-700'
            }`}
          >
            {Object.entries(statusMap).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => deleteOrder(order.id)}
            className="ml-auto text-stone-400 hover:text-red-600 text-xs font-bold flex items-center gap-1"
          >
            <Trash2 size={14} /> 刪除訂單
          </button>
        </div>

        <div className="mb-3 flex gap-2 items-center border-t border-stone-200 pt-3">
          <p className="font-bold text-stone-500 text-xs shrink-0">手動折抵</p>
          <input
            type="number"
            value={
              adminDiscountInputs[order.id] !== undefined
                ? adminDiscountInputs[order.id]
                : order.adminDiscount || 0
            }
            onChange={(e) =>
              setAdminDiscountInputs({
                ...adminDiscountInputs,
                [order.id]: e.target.value
              })
            }
            className="flex-1 bg-white border border-stone-200 rounded p-1.5 text-xs outline-none focus:border-amber-400 font-bold text-red-500 min-w-0"
          />
          <button
            type="button"
            onClick={() => saveAdminDiscount(order)}
            className="bg-stone-200 text-stone-600 text-xs font-bold px-2 py-1.5 rounded hover:bg-stone-300 transition-colors shrink-0"
          >
            儲存
          </button>
        </div>

        <div className="border-t border-stone-200 pt-3">
          <p className="font-bold text-stone-500 mb-1 text-xs">訂單備註</p>
          <div className="flex gap-2">
            <textarea
              placeholder="買家備註或管理備註"
              value={
                adminNoteInputs[order.id] !== undefined ? adminNoteInputs[order.id] : order.orderNote || ''
              }
              onChange={(e) =>
                setAdminNoteInputs({
                  ...adminNoteInputs,
                  [order.id]: e.target.value
                })
              }
              rows={3}
              className="flex-1 bg-amber-50/50 border border-amber-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-amber-400 text-amber-900"
            />
            <button
              type="button"
              onClick={() => saveOrderNote(order.id)}
              className="bg-amber-100 text-amber-700 text-xs font-bold px-3 rounded hover:bg-amber-200 transition-colors shrink-0 self-end"
            >
              儲存
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-600 space-y-1 bg-stone-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <span>商品小計</span>
            <span>${order.totals.itemsBaseTotal}</span>
          </div>
          {order.totals.discountAmount > 0 &&
            (() => {
              const disc = getDiscountDisplay(order.totals)
              return (
                <div className="flex justify-between gap-2 text-rose-500">
                  <span className="min-w-0">
                    {disc?.title || '活動折抵'}
                    {disc?.detail && (
                      <span className="block text-[10px] font-normal text-rose-600 mt-0.5">{disc.detail}</span>
                    )}
                  </span>
                  <span className="shrink-0">-${order.totals.discountAmount}</span>
                </div>
              )
            })()}
          <div className="flex justify-between">
            <span>運費</span>
            <span>${order.totals.shippingFee}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-stone-200 font-black text-amber-700 text-base">
            <span>總金額</span>
            <span>${order.totals.finalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderTable({
  orders,
  statusMap,
  requestOrderStatusChange,
  deleteOrder,
  trackingInputs,
  setTrackingInputs,
  saveTrackingNumber,
  adminDiscountInputs,
  setAdminDiscountInputs,
  saveAdminDiscount,
  adminNoteInputs,
  setAdminNoteInputs,
  saveOrderNote,
  openAdminCustomerFromOrder
}) {
  const [detailOrder, setDetailOrder] = useState(null)

  /** 浮層內勿沿用開啟當下的快照，改與列表 orders 同步（狀態下拉才會即時更新） */
  const detailLiveOrder = useMemo(() => {
    if (!detailOrder) return null
    return orders.find((o) => o.id === detailOrder.id) ?? detailOrder
  }, [orders, detailOrder])

  useEffect(() => {
    if (!detailOrder) return
    if (!orders.some((o) => o.id === detailOrder.id)) setDetailOrder(null)
  }, [orders, detailOrder])

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-inner -mx-1">
        <table className="w-full text-left border-collapse min-w-[1180px]">
          <thead className="bg-stone-100 sticky top-0 z-10 shadow-sm">
            <tr className="text-[11px] md:text-xs text-stone-600 font-black uppercase tracking-wide">
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap">訂單編號</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap w-[140px]">訂單狀態</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap">訂單時間</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap">客戶姓名</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap">電話</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap min-w-[128px]">物流單號</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap">購買明細</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap min-w-[140px]">訂單備註</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap text-right">總金額</th>
              <th className="px-2 py-3 border-b border-stone-200 whitespace-nowrap text-center w-14">刪除</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isCancelReq = order.status === 'cancel_requested'
              const itemCount = order.items?.length || 0
              const noteVal =
                adminNoteInputs[order.id] !== undefined ? adminNoteInputs[order.id] : order.orderNote || ''

              return (
                <Fragment key={order.id}>
                  <tr
                    className={`text-xs border-b border-stone-100 hover:bg-amber-50/40 transition-colors ${
                      isCancelReq ? 'bg-orange-50/60' : ''
                    }`}
                  >
                    <td className="px-2 py-2 align-top font-mono font-bold text-stone-800 whitespace-nowrap">
                      <span className="block">{order.id}</span>
                      <span className="flex flex-wrap gap-1 mt-1">
                        {order.isMerged && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded">合併</span>
                        )}
                        {order.createdByAdmin && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded">代建</span>
                        )}
                        {order.priceAudit?.status === 'mismatch' && (
                          <span className="text-[9px] bg-rose-200 text-rose-900 px-1 rounded font-black">
                            價格異常
                          </span>
                        )}
                        {order.priceAudit?.status === 'error' && (
                          <span className="text-[9px] bg-orange-200 text-orange-900 px-1 rounded font-black">
                            審計錯誤
                          </span>
                        )}
                        {order.priceAudit?.status === 'ok' && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">
                            審計通過
                          </span>
                        )}
                        {order.priceAudit?.status === 'skipped' && (
                          <span className="text-[9px] bg-stone-200 text-stone-600 px-1 rounded font-bold">
                            審計略過
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <select
                        value={order.status || 'confirming'}
                        onChange={(e) => requestOrderStatusChange(order, e.target.value)}
                        className={`w-full max-w-[132px] text-[11px] font-bold outline-none rounded p-1 cursor-pointer shadow-sm border border-stone-200 ${
                          statusMap?.[order.status]?.color || 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {Object.entries(statusMap).map(([key, info]) => (
                          <option key={key} value={key}>
                            {info.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 align-top text-stone-600 whitespace-nowrap text-[11px]">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-2 py-2 align-top max-w-[120px]">
                      <button
                        type="button"
                        onClick={() => openAdminCustomerFromOrder(order)}
                        className="text-left text-blue-700 font-bold hover:underline truncate w-full"
                        title="開啟客戶管理"
                      >
                        {order.customerInfo?.name || '—'}
                      </button>
                      <span className="text-[10px] text-stone-400 block truncate">
                        {order.customerInfo?.gender ? `（${order.customerInfo.gender}）` : ''}
                      </span>
                    </td>
                    <td className="px-2 py-2 align-top text-stone-700 whitespace-nowrap font-mono text-[11px]">
                      {order.customerInfo?.phone || '—'}
                    </td>
                    <td className="px-2 py-2 align-top max-w-[150px]">
                      {order.status === 'shipping' || order.status === 'shipped' ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            placeholder={order.status === 'shipping' ? '輸入單號' : '單號'}
                            value={trackingInputs[order.id] ?? order.trackingNumber ?? ''}
                            onChange={(e) =>
                              setTrackingInputs({
                                ...trackingInputs,
                                [order.id]: e.target.value
                              })
                            }
                            className="w-full bg-stone-50 border border-stone-200 rounded px-1.5 py-1 text-[11px] outline-none focus:border-purple-400 font-mono font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => saveTrackingNumber(order.id)}
                            className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded hover:bg-purple-200 transition-colors"
                          >
                            儲存
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-[11px] font-mono break-all ${order.trackingNumber ? 'text-stone-800 font-bold' : 'text-stone-400'}`}
                          title={order.trackingNumber || ''}
                        >
                          {order.trackingNumber || '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 align-top">
                      <div className="text-[11px] text-stone-600 mb-1">{itemCount} 項</div>
                      <button
                        type="button"
                        onClick={() => setDetailOrder(order)}
                        className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 hover:bg-amber-200 font-bold px-2 py-1 rounded-lg text-[11px] transition-colors"
                      >
                        <Eye size={14} /> 查看更多
                      </button>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <textarea
                        rows={2}
                        placeholder="備註"
                        value={noteVal}
                        onChange={(e) =>
                          setAdminNoteInputs({
                            ...adminNoteInputs,
                            [order.id]: e.target.value
                          })
                        }
                        className="w-full min-w-[120px] max-w-[200px] bg-amber-50/50 border border-amber-200 rounded px-1.5 py-1 text-[11px] outline-none focus:border-amber-400 text-amber-900 leading-snug"
                      />
                      <button
                        type="button"
                        onClick={() => saveOrderNote(order.id)}
                        className="mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded hover:bg-amber-200"
                      >
                        儲存備註
                      </button>
                    </td>
                    <td className="px-2 py-2 align-top text-right font-black text-amber-700 text-sm whitespace-nowrap">
                      ${order.totals?.finalPrice ?? '—'}
                    </td>
                    <td className="px-2 py-2 align-top text-center">
                      <button
                        type="button"
                        onClick={() => deleteOrder(order.id)}
                        className="text-stone-300 hover:text-red-600 transition-colors p-1 inline-flex"
                        aria-label="刪除訂單"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  {(order.status === 'confirming' || isCancelReq) && (
                    <tr className="bg-amber-50/80">
                      <td colSpan={10} className="px-3 py-2 text-[11px] font-bold border-b border-stone-100">
                        {order.status === 'confirming' && (
                          <span className="text-amber-800">待付款確認 — 請於 LINE 與客戶確認付款</span>
                        )}
                        {PAID_STATUSES.includes(order.status) && order.paymentMethod && (
                          <span className="text-blue-800 block mt-1">
                            付款：{getPaymentMethodLabel(order.paymentMethod)}
                            {order.paymentNote ? ` · ${order.paymentNote}` : ''}
                          </span>
                        )}
                        {isCancelReq && (
                          <span className="text-orange-700 block">
                            買家已申請取消，請於狀態選單處理
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <OrderDetailModal
        order={detailLiveOrder}
        onClose={() => setDetailOrder(null)}
        statusMap={statusMap}
        requestOrderStatusChange={requestOrderStatusChange}
        deleteOrder={deleteOrder}
        trackingInputs={trackingInputs}
        setTrackingInputs={setTrackingInputs}
        saveTrackingNumber={saveTrackingNumber}
        adminDiscountInputs={adminDiscountInputs}
        setAdminDiscountInputs={setAdminDiscountInputs}
        saveAdminDiscount={saveAdminDiscount}
        adminNoteInputs={adminNoteInputs}
        setAdminNoteInputs={setAdminNoteInputs}
        saveOrderNote={saveOrderNote}
      />
    </>
  )
}
