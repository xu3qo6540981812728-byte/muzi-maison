import {
  CheckCircle,
  Copy,
  CreditCard,
  EditIcon,
  MessageCircle,
  UserIcon,
  X
} from '../Icons'

export default function MemberProfileModal({
  onClose,
  isEditingProfile,
  setIsEditingProfile,
  userProfile,
  customerInfo,
  setCustomerInfo,
  handleUpdateMyProfile,
  myOrders,
  statusMap,
  contactData,
  copiedOrderId,
  handleCopyOrder,
  bankCodeInputs,
  setBankCodeInputs,
  submitBankCode,
  requestCancelOrder
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
      <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-4xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-200 pb-2">
          <UserIcon size={24} className="text-amber-600" /> 會員中心
        </h2>

        <div className="flex-1 overflow-y-auto space-y-6 md:flex md:space-y-0 md:gap-6">
          <div className="md:w-1/3 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-700">我的資料</h3>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs flex items-center gap-1 text-amber-600 font-bold hover:text-amber-700"
                  >
                    <EditIcon size={14} /> 修改
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingProfile(false)
                      setCustomerInfo({
                        name: userProfile?.name || '',
                        phone: userProfile?.phone || '',
                        address: userProfile?.address || '',
                        email: userProfile?.email || '',
                        lineId: userProfile?.lineId || '',
                        gender: userProfile?.gender || '女'
                      })
                    }}
                    className="text-xs text-stone-400 font-bold hover:text-stone-600"
                  >
                    取消
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-3 text-sm">
                  <input
                    type="text"
                    placeholder="姓名"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="男"
                        checked={customerInfo.gender === '男'}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, gender: e.target.value })
                        }
                        className="accent-amber-500"
                      />
                      男
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="女"
                        checked={customerInfo.gender === '女'}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, gender: e.target.value })
                        }
                        className="accent-amber-500"
                      />
                      女
                    </label>
                  </div>
                  <input
                    type="tel"
                    placeholder="聯絡電話"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, phone: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Line ID"
                    value={customerInfo.lineId}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, lineId: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                  />
                  <textarea
                    placeholder="預設地址"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, address: e.target.value })
                    }
                    rows="2"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleUpdateMyProfile}
                    className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow-sm hover:bg-amber-600 transition-colors"
                  >
                    儲存修改
                  </button>
                </div>
              ) : (
                <div className="text-sm text-stone-600 space-y-3">
                  <p className="flex justify-between">
                    <span className="text-stone-400">姓名</span>{' '}
                    <span className="font-bold">
                      {customerInfo.name} ({customerInfo.gender})
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-stone-400">電話</span>{' '}
                    <span>{customerInfo.phone}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-stone-400">Line</span>{' '}
                    <span>{customerInfo.lineId || '-'}</span>
                  </p>
                  <p>
                    <span className="text-stone-400 block mb-1">預設地址</span>{' '}
                    <span className="block bg-stone-50 p-2 rounded">
                      {customerInfo.address || '未設定'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <h3 className="font-bold text-stone-700 mb-3 border-b border-stone-200 pb-2">
              我的訂單紀錄
            </h3>
            {myOrders.length === 0 ? (
              <p className="text-center text-stone-400 text-sm py-10 bg-white rounded-2xl border border-stone-200 border-dashed">
                尚無訂單紀錄
              </p>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  const statusInfo =
                    statusMap?.[order.status] || statusMap?.pending
                  const isCancellable = ['pending', 'confirming', 'confirmed'].includes(order.status)

                  return (
                    <div
                      key={order.id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm text-sm relative"
                    >
                      {['pending', 'confirming'].includes(order.status) && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#06C755] rounded-t-2xl"></div>
                      )}

                      <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3 mt-1">
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
                              管理員代建
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusInfo?.color || 'bg-stone-100 text-stone-700'}`}
                          >
                            {statusInfo?.label || '未處理'}
                          </span>
                          {order.status === 'shipped' && (
                            <div className="mt-2 text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded">
                              物流單號: {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-stone-600 text-xs space-y-1.5 mb-4 bg-stone-50 p-3 rounded-lg">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center">
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
                                {item.isAddon &&
                                item.freeQty > 0 &&
                                item.paidQty > 0
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
                        {order.orderNote && (
                          <div className="mt-2 pt-2 border-t border-stone-200 text-amber-700">
                            <strong>備註：</strong>
                            {order.orderNote}
                          </div>
                        )}
                      </div>

                      {['pending', 'confirming'].includes(order.status) && (
                        <div className="mb-4 p-4 bg-[#06C755]/10 border border-[#06C755]/30 rounded-xl flex flex-col items-center text-center space-y-3">
                          <p className="text-xs font-bold text-[#06C755] flex items-center gap-1">
                            <MessageCircle size={16} /> 訂單已送出，請點擊下方加 LINE 通知我們才算完成訂單唷！
                          </p>
                          <div className="flex w-full gap-2">
                            <button
                              onClick={() => handleCopyOrder(order)}
                              className="flex-1 flex items-center justify-center gap-1 bg-stone-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm hover:bg-stone-700 transition-colors active:scale-95"
                            >
                              {copiedOrderId === order.id ? (
                                <CheckCircle
                                  size={14}
                                  className="text-emerald-400"
                                />
                              ) : (
                                <Copy size={14} />
                              )}
                              {copiedOrderId === order.id
                                ? '已複製！'
                                : '1. 複製明細'}
                            </button>
                            {contactData.lineLink ? (
                              <a
                                href={contactData.lineLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-[1.5] bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-lg py-2.5 flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
                              >
                                <MessageCircle size={16} /> 2. 前往 LINE 傳送
                              </a>
                            ) : (
                              <button
                                disabled
                                className="flex-[1.5] bg-stone-300 text-white text-xs font-bold rounded-lg py-2.5 flex items-center justify-center gap-1 shadow-sm cursor-not-allowed"
                              >
                                LINE 尚未設定
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {order.status === 'pending' && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                          <div>
                            <p className="text-xs font-bold text-rose-800 mb-1 flex items-center gap-1">
                              <CreditCard size={14} /> 匯款帳號資訊：
                            </p>
                            <p className="text-xs text-rose-700 whitespace-pre-wrap font-medium bg-white/60 p-2 rounded border border-rose-100">
                              {contactData.bankAccount ||
                                '店家尚未設定匯款帳號，請加 LINE 詢問'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-rose-700 mb-2">
                              ⚠️ 請匯款後加 LINE 通知，並輸入帳戶後五碼：
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength="5"
                                placeholder="輸入後五碼"
                                value={bankCodeInputs[order.id] || ''}
                                onChange={(e) =>
                                  setBankCodeInputs({
                                    ...bankCodeInputs,
                                    [order.id]: e.target.value
                                  })
                                }
                                className="flex-1 min-w-0 bg-white border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400 font-bold tracking-widest text-center"
                              />
                              <button
                                onClick={() => submitBankCode(order.id)}
                                className="shrink-0 whitespace-nowrap bg-rose-500 text-white font-bold px-4 rounded-lg shadow-sm active:scale-95 transition-transform"
                              >
                                送出
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {order.status === 'confirming' && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700 text-center">
                          已送出後五碼 ({order.bankAccountLast5})，等待對帳確認中...
                        </div>
                      )}

                      {order.status === 'confirmed' && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 text-center">
                          💡 為保持良好賞味，商品皆為接單製作，接單後5~7天出貨，感謝您的耐心等候！
                        </div>
                      )}

                      <div className="flex justify-between items-end mt-4 pt-3 border-t border-stone-100">
                        {isCancellable ? (
                          <button
                            onClick={() => requestCancelOrder(order.id)}
                            className="text-xs text-stone-400 hover:text-rose-500 font-bold transition-colors underline mb-1"
                          >
                            申請取消訂單
                          </button>
                        ) : (
                          <div></div>
                        )}
                        <div className="text-right text-xs text-stone-500 space-y-1">
                          <div>商品小計：${order.totals.itemsBaseTotal}</div>
                          {order.totals.discountAmount > 0 && (
                            <div className="text-rose-500">活動折抵：-${order.totals.discountAmount}</div>
                          )}
                          {order.adminDiscount > 0 && (
                            <div className="text-amber-500">特別折扣：-${order.adminDiscount}</div>
                          )}
                          <div>運費：${order.totals.shippingFee}</div>
                          <div className="font-black text-stone-800 text-xl pt-1">
                            總計：${order.totals.finalPrice}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

