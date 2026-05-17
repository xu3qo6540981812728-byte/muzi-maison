import {
  Info,
  Lock,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Truck,
  UserIcon,
  X
} from '../Icons'
import { Link } from 'react-router-dom'
import { getDiscountDisplay } from '../../utils/discountDisplay'
import { LINE_PAYMENT_REMINDER_SHORT } from '../../constants/linePayment'

export default function CartDrawer({
  isOpen,
  onClose,
  cartData,
  cart,
  addonProducts,
  updateCart,
  storeConfig,
  deliveryMethod,
  setDeliveryMethod,
  currentUser,
  adminOrderingFor,
  customerInfo,
  setCustomerInfo,
  orderNote,
  setOrderNote,
  onRequireLogin,
  handleCheckout,
  products,
  topSellers,
  groupBuyFriendMode = false,
  getItemQty = null
}) {
  if (!isOpen) return null
  /** 至少一項「非贈品」商品才可結帳（避免只有贈品或空車仍可按送出） */
  const purchasedQty = (cartData.items || [])
    .filter((item) => !item.isGift)
    .reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
  const canSubmitOrder = purchasedQty > 0
  const productList = products || []
  const qtyOf = (pid) =>
    typeof getItemQty === 'function' ? Number(getItemQty(pid)) || 0 : cart[pid] || 0
  const remainingToFreeShipping = Math.max(0, storeConfig.freeShippingThreshold - cartData.currentTotal)
  const recommendedForFreeShipping = (() => {
    if (remainingToFreeShipping <= 0) return []
    const selected = []
    const selectedIds = new Set()
    const tryPush = (p) => {
      if (!p || selectedIds.has(p.id)) return
      selected.push(p)
      selectedIds.add(p.id)
    }

    const hotProducts = ((topSellers?.items || [])
      .map((item) => productList.find((p) => p.id === item.id))
      .filter((p) => p && !p.isAddon))

    const cheapestHot = [...hotProducts].sort((a, b) => (a.price || 0) - (b.price || 0))[0]
    const closestHot = [...hotProducts].sort(
      (a, b) =>
        Math.abs((a.price || 0) - remainingToFreeShipping) -
        Math.abs((b.price || 0) - remainingToFreeShipping)
    )[0]

    tryPush(cheapestHot)
    tryPush(closestHot)

    const allByClosest = productList
      .filter((p) => !p.isAddon)
      .sort(
        (a, b) =>
          Math.abs((a.price || 0) - remainingToFreeShipping) -
          Math.abs((b.price || 0) - remainingToFreeShipping)
      )
    allByClosest.forEach((p) => tryPush(p))

    return selected.slice(0, 3)
  })()

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md md:max-w-4xl bg-brand-marble rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <ShoppingCart size={20} /> {groupBuyFriendMode ? '揪團選購明細' : '訂單結帳'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-stone-100 rounded-full text-stone-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:flex md:gap-8">
          <div className="md:w-1/2">
            {(() => {
              const providedQuota = cartData.items
                .filter((i) => !i.isAddon && i.providesFreeAddon)
                .reduce((sum, i) => sum + i.qty, 0)
              const usedQuota = cartData.items
                .filter((i) => i.isAddon)
                .reduce((sum, i) => sum + (i.freeQty || 0), 0)

              return (
                providedQuota > usedQuota && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-start gap-2 shadow-sm animate-pulse">
                    <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-blue-700 leading-relaxed whitespace-pre-wrap">
                      {storeConfig.freeAddonReminderMsg ||
                        '恭喜！您選購的主商品享有「0元加購」優惠！\n別忘了至下方加購專區挑選喔！'}
                    </p>
                  </div>
                )
              )
            })()}

            <h3 className="hidden md:block font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">
              已選商品
            </h3>

            {cartData.items.map((item, idx) => (
              <div
                key={item.id + idx}
                className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-stone-800 flex items-center gap-1 flex-wrap">
                    {item.name}
                    {item.groupSplitLabel && (
                      <span className="text-[10px] font-bold text-indigo-600">
                        （{item.groupSplitLabel}）
                      </span>
                    )}
                    {item.isPromo && !item.isGift && (
                      <span className="text-[9px] bg-rose-100 text-rose-600 px-1 py-0.5 rounded">
                        指定商品活動
                      </span>
                    )}
                    {item.isAddon && !item.isGift && (
                      <span className="text-[9px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded">
                        加購
                      </span>
                    )}
                    {item.isGift && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1 py-0.5 rounded font-bold">
                        滿件贈品
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-stone-500">
                    ${item.price} {item.unit ? `/${item.unit}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {!item.isGift ? (
                    <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1 border border-stone-200">
                      <button onClick={() => updateCart(item.id, -1)} className="p-1 text-stone-500">
                        <Minus size={14} />
                      </button>
                      <span className="w-4 text-center text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateCart(item.id, 1)} className="p-1 text-stone-800">
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 text-center text-sm font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-full">
                      x {item.qty}
                    </div>
                  )}
                  <div className="w-12 text-right font-bold text-stone-700">
                    {item.isAddon && item.freeQty > 0 ? (
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-[10px] text-stone-400 line-through">
                          ${item.price * item.qty}
                        </span>
                        <span className="text-amber-600">${item.subtotal}</span>
                      </div>
                    ) : (
                      `$${item.subtotal}`
                    )}
                  </div>
                </div>
              </div>
            ))}

            {addonProducts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <Plus size={18} className="text-amber-500" /> 加購專區
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {addonProducts.map((addon) => (
                    <div
                      key={addon.id}
                      className="bg-white border border-stone-200 rounded-xl p-2.5 flex gap-3 shadow-sm relative overflow-hidden"
                    >
                      <img
                        src={addon.thumbUrl || addon.image || 'https://via.placeholder.com/150?text=Empty'}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        className="w-14 h-14 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <h4 className="font-bold text-stone-800 text-xs truncate" title={addon.name}>
                          {addon.name}
                        </h4>
                        <div className="flex justify-between items-end mt-1">
                          <span className="text-amber-600 font-bold text-sm">
                            ${addon.price}{' '}
                            {addon.unit && (
                              <span className="text-[10px] text-stone-400">/{addon.unit}</span>
                            )}
                          </span>
                          {qtyOf(addon.id) ? (
                            <div className="flex items-center gap-2 bg-stone-50 rounded-full px-1.5 py-0.5 border border-stone-200">
                              <button
                                onClick={() => updateCart(addon.id, -1)}
                                className="text-stone-500 p-0.5"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="text-xs font-bold w-3 text-center">{qtyOf(addon.id)}</span>
                              <button
                                onClick={() => updateCart(addon.id, 1)}
                                className="text-amber-600 p-0.5"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateCart(addon.id, 1)}
                              className="text-[10px] bg-stone-800 text-white px-3 py-1.5 rounded-full font-bold hover:bg-stone-700 shadow-sm active:scale-95 transition-transform"
                            >
                              加入
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!groupBuyFriendMode && (
            <div className="mt-6 pt-4 border-t border-stone-100">
              <h3 className="font-bold text-stone-800 mb-3">取貨方式</h3>
              <div className="flex gap-4 mb-4">
                <label
                  className={`flex-1 border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    deliveryMethod === 'delivery'
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'bg-white border-stone-200 text-stone-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="hidden"
                  />
                  <Truck size={20} />
                  <span className="text-sm font-bold">宅配</span>
                  <span className="text-[10px] text-center whitespace-pre-line">
                    {cartData.currentTotal >= storeConfig.freeShippingThreshold
                      ? `已滿 $${storeConfig.freeShippingThreshold} 免運`
                      : `還差 $${storeConfig.freeShippingThreshold - cartData.currentTotal} 免運\n(運費 $${storeConfig.shippingFee})`}
                  </span>
                </label>
                <label
                  className={`flex-1 border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    deliveryMethod === 'pickup'
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'bg-white border-stone-200 text-stone-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="hidden"
                  />
                  <Store size={20} />
                  <span className="text-sm font-bold">自取</span>
                  <span className="text-[10px]">免運費</span>
                </label>
              </div>
            </div>
            )}

            {!groupBuyFriendMode && (
            <div className="mt-4 bg-white border border-stone-200 p-4 rounded-2xl space-y-2 text-sm">
              <h4 className="font-bold text-stone-800">結帳資訊</h4>
              <p className="text-stone-600">
                宅配運費：${storeConfig.shippingFee}，滿 ${storeConfig.freeShippingThreshold} 免運
              </p>
              <p className="text-stone-600">
                {remainingToFreeShipping > 0
                  ? `目前還差 $${remainingToFreeShipping} 可享免運`
                  : '已達免運門檻，恭喜免運！'}
              </p>
              {recommendedForFreeShipping.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-amber-700 font-bold text-xs mb-2">免運推薦商品（可點擊查看）</p>
                  <div className="grid grid-cols-1 gap-2">
                    {recommendedForFreeShipping.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={onClose}
                        className="bg-white border border-amber-100 rounded-lg p-2 hover:border-amber-300 flex gap-2 items-center"
                      >
                        <img
                          src={p.thumbUrl || p.image}
                          alt={p.name}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                          className="w-10 h-10 rounded-md object-cover bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-700 leading-tight break-words">{p.name}</p>
                          <p className="text-xs text-amber-700 font-bold mt-1">${p.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-stone-600">出貨天數：接單後約 5-7 天出貨</p>
              <p className="text-stone-600 whitespace-pre-wrap">
                付款說明：{LINE_PAYMENT_REMINDER_SHORT}
              </p>
            </div>
            )}

            <div className="mt-4 bg-stone-50 p-4 rounded-2xl space-y-2">
              {groupBuyFriendMode && (
                <p className="text-xs font-bold text-amber-800 mb-2">
                  以下金額為參考（含試算運費），實際結帳由主揪統一處理。
                </p>
              )}
              <div className="flex justify-between text-sm text-stone-600">
                <span>商品小計</span>
                <span>${cartData.itemsBaseTotal}</span>
              </div>
              {cartData.discountAmount > 0 && (() => {
                const disc = getDiscountDisplay(cartData)
                return (
                  <div className="flex justify-between gap-3 text-sm text-rose-500 font-bold">
                    <span className="min-w-0 flex-1">
                      <span className="block">{disc?.title || '活動折抵'}</span>
                      {disc?.detail && (
                        <span className="block text-[10px] font-normal text-rose-600 leading-snug mt-0.5">
                          {disc.detail}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0">-${cartData.discountAmount}</span>
                  </div>
                )
              })()}
              <div className="flex justify-between text-sm text-stone-600">
                <span>運費</span>
                <span className={cartData.shippingFee === 0 && deliveryMethod === 'delivery' ? 'text-emerald-500 font-bold' : ''}>
                  {cartData.shippingFee === 0
                    ? deliveryMethod === 'pickup'
                      ? '$0'
                      : '免運費'
                    : `$${cartData.shippingFee}`}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-stone-200 flex justify-between items-center">
                <span className="font-bold text-stone-800">總計金額</span>
                <span className="text-2xl font-black text-stone-800">${cartData.finalPrice}</span>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 md:border-l border-stone-200 md:pl-8 flex flex-col mt-6 md:mt-0">
            {groupBuyFriendMode ? (
              <div className="flex-1 flex flex-col justify-center bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Info size={22} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-black text-amber-950 mb-2">無法在此結帳</h3>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      揪團訂單須由主揪從購物車統一送出。你可在此確認自己的選購數量，或關閉視窗繼續逛商店。
                    </p>
                  </div>
                </div>
              </div>
            ) : !currentUser && !adminOrderingFor ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-white border border-stone-200 p-6 rounded-2xl text-center h-full">
                <UserIcon size={48} className="text-stone-400 mb-4 opacity-60" />
                <h3 className="text-lg font-bold text-stone-800 mb-2">請選擇結帳方式</h3>
                <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                  已是會員可登入結帳；非會員也可快速結帳（建立會員帳號）。
                </p>
                <button
                  onClick={onRequireLogin}
                  className="w-full bg-stone-800 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2"
                >
                  <Lock size={18} /> 前往結帳
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <h3 className="font-bold text-stone-800 border-b border-stone-200 pb-2 flex justify-between items-center">
                    聯絡資訊
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">
                      {adminOrderingFor ? '管理員代建單' : '會員已登入'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="姓名"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="聯絡電話"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Line ID (必填，方便聯繫)"
                    value={customerInfo.lineId}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, lineId: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="收件/聯絡地址 (必填)"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 text-sm"
                  />
                  <textarea
                    placeholder="訂單備註 (選填，例如：請避開假日送件)"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows="2"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 text-sm mt-2"
                  />

                  {!adminOrderingFor && (
                    <div className="bg-[#06C755]/10 border border-[#06C755]/30 p-4 rounded-xl mt-4">
                      <p className="text-sm font-bold text-[#06C755] flex items-center gap-1 mb-1">
                        <MessageCircle size={16} /> 付款方式
                      </p>
                      <p className="text-xs text-stone-700 whitespace-pre-wrap font-medium leading-relaxed">
                        {LINE_PAYMENT_REMINDER_SHORT}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-stone-200 bg-white">
          {groupBuyFriendMode ? (
            <p className="text-center text-sm text-stone-700 font-bold leading-relaxed px-2">
              選購完成後請通知主揪；由主揪開啟購物車並送出訂單後，此揪團即結束。
            </p>
          ) : currentUser || adminOrderingFor ? (
            <>
              {!canSubmitOrder && (
                <p className="text-center text-sm text-rose-600 font-bold mb-3 px-2">
                  請至少選購一項商品後，再送出訂單。
                </p>
              )}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canSubmitOrder}
                className={`w-full font-bold rounded-2xl p-4 flex items-center justify-center gap-2 shadow-lg transition-transform ${
                  canSubmitOrder
                    ? 'bg-[#06C755] text-white active:scale-95'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <MessageCircle size={20} />
                {adminOrderingFor ? '完成代建訂單' : '送出訂單並前往確認'}
              </button>
              <p className="text-center text-[10px] text-stone-400 mt-3 font-medium">
                ※ 為保持良好賞味，商品皆為接單製作，接單後5~7天出貨，敬請見諒
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

