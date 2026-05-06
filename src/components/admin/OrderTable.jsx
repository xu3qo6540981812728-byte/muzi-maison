import { Trash2 } from '../Icons'

export default function OrderTable({
  orders,
  statusMap,
  updateOrderStatus,
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => {
        const isCancelReq = order.status === 'cancel_requested'

        return (
          <div
            key={order.id}
            className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col transition-colors ${
              isCancelReq
                ? 'border-orange-400 ring-2 ring-orange-100'
                : 'border-stone-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3 relative">
              <div>
                <span className="font-black text-stone-800 text-lg block tracking-wide">
                  {order.id}
                </span>
                <span className="text-[10px] text-stone-400">
                  {order.createdAt?.toDate().toLocaleString()}
                </span>
                {order.isMerged && (
                  <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                    合併訂單
                  </span>
                )}
                {order.createdByAdmin && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded mt-1 inline-block ml-1">
                    代建單
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={order.status || 'pending'}
                  onChange={(e) => updateOrderStatus(order, e.target.value)}
                  className={`text-xs font-bold outline-none rounded p-1.5 cursor-pointer shadow-sm border border-stone-200 ${
                    statusMap?.[order.status]?.color ||
                    'bg-stone-100 text-stone-700'
                  }`}
                >
                  {Object.entries(statusMap).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => deleteOrder(order.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {order.status === 'confirming' && (
              <div className="mb-3 bg-amber-50 text-amber-700 text-xs font-bold p-2 rounded-lg text-center border border-amber-200">
                💰 客填後五碼：{' '}
                <span className="text-base tracking-widest">
                  {order.bankAccountLast5}
                </span>
              </div>
            )}

            {isCancelReq && (
              <div className="mb-3 bg-orange-50 text-orange-700 text-xs font-bold p-2 rounded-lg text-center border border-orange-200 animate-pulse">
                ⚠️ 買家已送出取消申請，請審核！
              </div>
            )}

            {order.status === 'shipped' && (
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  placeholder="輸入出貨單號"
                  value={trackingInputs[order.id] || ''}
                  onChange={(e) =>
                    setTrackingInputs({
                      ...trackingInputs,
                      [order.id]: e.target.value
                    })
                  }
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-purple-400 font-bold"
                />
                <button
                  onClick={() => saveTrackingNumber(order.id)}
                  className="bg-purple-100 text-purple-700 text-xs font-bold px-3 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  儲存
                </button>
              </div>
            )}

            <div className="text-sm text-stone-600 space-y-1 mb-3 bg-stone-50 p-3 rounded-lg">
              <p>
                <span className="font-bold text-stone-500">姓名：</span>
                {order.customerInfo.name} ({order.customerInfo.gender})
              </p>
              <p>
                <span className="font-bold text-stone-500">電話：</span>
                {order.customerInfo.phone}
              </p>
              <p>
                <span className="font-bold text-stone-500">Line：</span>
                {order.customerInfo.lineId || '-'}
              </p>
              <p className="truncate" title={order.customerInfo.address}>
                <span className="font-bold text-stone-500">地址：</span>
                {order.customerInfo.address}
              </p>
            </div>

            <div className="flex-1 text-xs text-stone-600 space-y-1 mb-3">
              <p className="font-bold text-stone-500 mb-1 border-b border-stone-200 pb-1">
                購買明細：
              </p>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center mb-1">
                  <span>
                    {item.name}{' '}
                    {item.weight && (
                      <span className="text-[10px] text-stone-500 font-normal ml-1">
                        ({item.weight})
                      </span>
                    )}{' '}
                    {item.isAddon && (
                      <span className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded">
                        加購
                      </span>
                    )}{' '}
                    {item.isGift && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1 rounded font-bold">
                        滿件贈品
                      </span>
                    )}{' '}
                    <span className="text-stone-400 text-[10px]">
                      (
                      {item.isAddon && item.freeQty > 0 && item.paidQty > 0
                        ? `${item.freeQty}件$0, ${item.paidQty}件$${item.price}`
                        : item.subtotal === 0
                          ? '0'
                          : item.price}
                      )
                    </span>
                  </span>
                  <span className="font-bold">
                    x{item.qty} {item.unit || ''}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-3 border-t border-stone-100 pt-3 flex gap-2 items-center">
              <p className="font-bold text-stone-500 text-xs shrink-0">
                手動折扣：
              </p>
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
                className="flex-1 bg-white border border-stone-200 rounded p-1 text-xs outline-none focus:border-amber-400 font-bold text-red-500"
              />
              <button
                onClick={() => saveAdminDiscount(order)}
                className="bg-stone-200 text-stone-600 text-xs font-bold px-2 py-1 rounded hover:bg-stone-300 transition-colors"
              >
                儲存
              </button>
            </div>

            <div className="mb-3 border-t border-stone-100 pt-3">
              <p className="font-bold text-stone-500 mb-1 text-xs flex justify-between">
                訂單備註：
                <span className="text-[9px] font-normal text-stone-400">可查看與編輯</span>
              </p>
              <div className="flex gap-2">
                <textarea
                  placeholder="買家未填寫或輸入您的備註"
                  value={
                    adminNoteInputs[order.id] !== undefined
                      ? adminNoteInputs[order.id]
                      : order.orderNote || ''
                  }
                  onChange={(e) =>
                    setAdminNoteInputs({
                      ...adminNoteInputs,
                      [order.id]: e.target.value
                    })
                  }
                  className="flex-1 bg-amber-50/50 border border-amber-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-amber-400 min-h-[40px] text-amber-900"
                />
                <button
                  onClick={() => saveOrderNote(order.id)}
                  className="bg-amber-100 text-amber-700 text-xs font-bold px-3 rounded hover:bg-amber-200 transition-colors shrink-0"
                >
                  儲存<br />備註
                </button>
              </div>
            </div>

            <div className="mt-auto border-t border-stone-100 pt-3">
              <div className="bg-stone-50 p-2 rounded-lg text-right text-xs text-stone-500 mb-2 space-y-1">
                <div className="flex justify-between">
                  <span>商品小計</span>
                  <span>${order.totals.itemsBaseTotal}</span>
                </div>
                {order.totals.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>活動折抵</span>
                    <span>-${order.totals.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>運費</span>
                  <span>${order.totals.shippingFee}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-500 font-bold">總金額</span>
                <span className="font-black text-amber-600 text-xl">
                  ${order.totals.finalPrice}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

