import {
  CreditCard,
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
  contactData,
  checkoutBankCode,
  setCheckoutBankCode,
  onRequireLogin,
  handleCheckout,
  products
}) {
  if (!isOpen) return null
  const remainingToFreeShipping = Math.max(0, storeConfig.freeShippingThreshold - cartData.currentTotal)
  const recommendedForFreeShipping =
    remainingToFreeShipping > 0
      ? (products || [])
          .filter((p) => !p.isAddon)
          .sort(
            (a, b) =>
              Math.abs((a.price || 0) - remainingToFreeShipping) -
              Math.abs((b.price || 0) - remainingToFreeShipping)
          )
          .slice(0, 3)
      : null

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md md:max-w-4xl bg-[#Fdfbf7] rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <ShoppingCart size={20} /> 訂單結帳
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
                  <h4 className="font-bold text-stone-800 flex items-center gap-1">
                    {item.name}
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
                        src={addon.image || 'https://via.placeholder.com/150?text=Empty'}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
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
                          {cart[addon.id] ? (
                            <div className="flex items-center gap-2 bg-stone-50 rounded-full px-1.5 py-0.5 border border-stone-200">
                              <button
                                onClick={() => updateCart(addon.id, -1)}
                                className="text-stone-500 p-0.5"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="text-xs font-bold w-3 text-center">{cart[addon.id]}</span>
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
              {recommendedForFreeShipping && remainingToFreeShipping > 0 && recommendedForFreeShipping.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-amber-700 font-bold text-xs mb-2">免運推薦商品（可點擊查看）</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {recommendedForFreeShipping.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={onClose}
                        className="bg-white border border-amber-100 rounded-lg p-2 hover:border-amber-300 flex gap-2 items-center"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                          className="w-10 h-10 rounded-md object-cover bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-700 truncate">{p.name}</p>
                          <p className="text-xs text-amber-700 font-bold mt-1">${p.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-stone-600">出貨天數：接單後約 5-7 天出貨</p>
              <p className="text-stone-600 whitespace-pre-wrap">
                匯款說明：下單後可輸入後五碼，並將訂單編號回報 LINE 以加速對帳。
              </p>
            </div>

            <div className="mt-4 bg-stone-50 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm text-stone-600">
                <span>商品小計</span>
                <span>${cartData.itemsBaseTotal}</span>
              </div>
              {cartData.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-rose-500 font-bold">
                  <span>活動折抵</span>
                  <span>-${cartData.discountAmount}</span>
                </div>
              )}
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
            {!currentUser && !adminOrderingFor ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center h-full">
                <UserIcon size={48} className="text-amber-500 mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-amber-800 mb-2">會員專屬服務</h3>
                <p className="text-sm text-amber-700 mb-6 leading-relaxed">
                  為了給您更好的服務與後續訂單追蹤，木子家MUZI MAISON目前
                  <span className="font-bold text-rose-600">僅開放會員訂購</span>喔！
                </p>
                <button
                  onClick={onRequireLogin}
                  className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2"
                >
                  <Lock size={18} /> 前往登入 / 免費註冊
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
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mt-4">
                      <p className="text-sm font-bold text-emerald-800 flex items-center gap-1 mb-1">
                        <CreditCard size={16} /> 匯款資訊 (若已匯款可直接填寫)
                      </p>
                      <p className="text-xs text-emerald-700 whitespace-pre-wrap font-medium mb-3">
                        {contactData.bankAccount || '店家尚未設定匯款帳號，請加 LINE 詢問'}
                      </p>
                      <input
                        type="text"
                        maxLength="5"
                        placeholder="輸入帳戶後五碼 (選填)"
                        value={checkoutBankCode}
                        onChange={(e) => setCheckoutBankCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 text-sm tracking-widest font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-stone-200 bg-white">
          {currentUser || adminOrderingFor ? (
            <>
              <button
                onClick={handleCheckout}
                className="w-full bg-[#06C755] text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              >
                <MessageCircle size={20} />
                {adminOrderingFor ? '完成代建訂單' : '送出訂單並前往確認'}
              </button>
              <p className="text-center text-[10px] text-stone-400 mt-3 font-medium">
                ※ 為保持良好賞味，商品皆為接單製作，接單後5~7天出貨，敬請見諒
              </p>
            </>
          ) : (
            <button
              onClick={onRequireLogin}
              className="w-full bg-stone-800 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <UserIcon size={20} /> 點此登入會員結帳
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

