import {
  ChevronRight,
  DownloadIcon,
  EditIcon,
  LinkIcon,
  Plus,
  SearchIcon,
  ShoppingCart,
  Trash2,
  UserIcon,
  UsersIcon,
  X
} from '../Icons'
import CustomerTable from './CustomerTable'

function formatConsentAt(ts) {
  if (!ts) return null
  if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString('zh-TW')
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString('zh-TW')
}

export default function AdminCustomersModal({
  onClose,
  selectedCustomer,
  setSelectedCustomer,
  isEditingAdminCustomer,
  setIsEditingAdminCustomer,
  isMergeMode,
  setIsMergeMode,
  mergeSelection,
  setMergeSelection,
  isNewCustomer,
  showDeletedCustomers,
  setShowDeletedCustomers,
  customerSearchName,
  setCustomerSearchName,
  handleAddCustomerBtn,
  pagedCustomers,
  filteredUsersCount,
  userLimit,
  setUserLimit,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  canGoPrev,
  canGoNext,
  startAdminOrder,
  allUsers,
  handleDeleteCustomer,
  handleUpdateCustomerByAdmin,
  handleRestoreCustomer,
  allOrders,
  oldOrders,
  handleConfirmMerge,
  handleToggleMergeOrder,
  setOrderSearchId,
  setOrderStatusFilter,
  setShowAdminOrders,
  navigate,
  statusMap,
  onDownloadPrivacyConsentPdf
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-2 sm:px-4 md:px-5 py-4 md:py-6">
      <div className="bg-brand-marble p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-[min(96vw,1920px)] h-full max-h-[calc(100vh-2rem)] flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full">
          <X size={24} />
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-stone-200 pb-3 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-stone-800 flex items-center gap-2">
            <UsersIcon size={24} className="text-blue-600" /> 客戶管理中心
          </h2>
          {!selectedCustomer && (
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 flex-1 min-w-[200px]">
                <SearchIcon size={16} className="text-stone-400" />
                <input
                  type="text"
                  placeholder="搜尋姓名、電話或 Email…"
                  value={customerSearchName}
                  onChange={(e) => setCustomerSearchName(e.target.value)}
                  className="w-full text-sm outline-none font-bold"
                />
              </div>
              <button
                onClick={() => setShowDeletedCustomers(!showDeletedCustomers)}
                className={`text-sm font-bold px-3 py-2 rounded-lg shadow-sm transition-colors border ${
                  showDeletedCustomers
                    ? 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                {showDeletedCustomers ? '返回正常名單' : '查看停用名單'}
              </button>
              {!showDeletedCustomers && (
                <button
                  onClick={handleAddCustomerBtn}
                  className="bg-blue-600 text-white text-sm font-bold px-3 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus size={16} /> 新增客戶
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!selectedCustomer ? (
            filteredUsersCount === 0 ? (
              <p className="text-center text-stone-400 mt-10">找不到客戶資料</p>
            ) : (
              <>
                <CustomerTable customers={pagedCustomers} onSelectCustomer={setSelectedCustomer} />
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 mb-4">
                  <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={!canGoPrev}
                    className="bg-stone-200 text-stone-700 px-5 py-2 rounded-full font-bold text-sm hover:bg-stone-300 transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一頁
                  </button>
                  <span className="text-sm font-bold text-stone-600 min-w-[160px] text-center">
                    第 {currentPage} 頁 / {totalPages}
                    <span className="block text-[10px] text-stone-400 font-bold mt-0.5">
                      共 {filteredUsersCount} 位客戶
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={onNextPage}
                    disabled={!canGoNext}
                    className="bg-stone-800 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-stone-700 transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一頁
                  </button>
                </div>
                {filteredUsersCount >= userLimit && currentPage === totalPages && (
                  <div className="flex justify-center mb-6">
                    <button
                      type="button"
                      onClick={() => setUserLimit((prev) => prev + 50)}
                      className="bg-stone-200 text-stone-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-300 transition-colors"
                    >
                      從資料庫載入更多客戶…
                    </button>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="flex flex-col md:flex-row gap-6 h-full">
              <div className="md:w-1/3">
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm sticky top-0 relative">
                  <button onClick={() => { setSelectedCustomer(null); setIsEditingAdminCustomer(false); setIsMergeMode(false); setMergeSelection([]) }} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 font-bold text-xs flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md">
                    <ChevronRight size={14} className="rotate-180" /> 返回
                  </button>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 mt-4 mx-auto ${selectedCustomer.role === 'deleted' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                    <UserIcon size={40} />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-stone-800 text-2xl">{selectedCustomer.name}</h3>
                    {selectedCustomer.role !== 'deleted' &&
                      (!isEditingAdminCustomer ? (
                        <button onClick={() => { setIsEditingAdminCustomer(true) }} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-blue-100">
                          <EditIcon size={14} /> 編輯
                        </button>
                      ) : (
                        <button onClick={() => { setIsEditingAdminCustomer(false); setSelectedCustomer(allUsers.find((u) => u.id === selectedCustomer.id)) }} className="text-xs font-bold text-stone-400 hover:text-stone-600">
                          取消
                        </button>
                      ))}
                  </div>

                  {selectedCustomer.role !== 'deleted' && !isEditingAdminCustomer && (
                    <>
                      <button onClick={() => startAdminOrder(selectedCustomer)} className="w-full mt-3 mb-2 bg-amber-500 text-white font-bold py-2.5 rounded-md shadow-sm hover:bg-amber-600 transition-colors flex justify-center items-center gap-2">
                        <ShoppingCart size={18} /> 代客下單
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadPrivacyConsentPdf?.(selectedCustomer)}
                        className="w-full mb-2 bg-teal-600 text-white font-bold py-2.5 rounded-md shadow-sm hover:bg-teal-700 transition-colors flex justify-center items-center gap-2"
                      >
                        <DownloadIcon size={18} /> 下載個資同意 PDF
                      </button>
                    </>
                  )}

                  {isEditingAdminCustomer ? (
                    <div className="space-y-3 text-sm bg-stone-50 p-4 rounded-xl border border-stone-200 mt-4">
                      <div className="rounded-md px-2 py-2 bg-white border border-stone-200 border-dashed">
                        <span className="text-[10px] font-bold text-stone-400 block mb-0.5">會員 Email（僅供顯示，無法修改）</span>
                        <span className="font-mono text-xs text-stone-700 break-all">{selectedCustomer.email || '（尚未綁定 Email）'}</span>
                      </div>
                      <input type="text" placeholder="姓名" value={selectedCustomer.name} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="?" checked={selectedCustomer.gender === '?'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />?</label>
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="?" checked={selectedCustomer.gender === '?'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />?</label>
                      </div>
                      <input type="tel" placeholder="手機號碼" value={selectedCustomer.phone} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <input type="text" placeholder="Line ID" value={selectedCustomer.lineId} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, lineId: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <textarea placeholder="聯絡地址" value={selectedCustomer.address} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })} rows="2" className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400"></textarea>

                      <div className="flex gap-2">
                        {!isNewCustomer && <button onClick={handleDeleteCustomer} className="bg-red-100 text-red-600 font-bold px-3 py-2 rounded-md hover:bg-red-200 transition-colors" title="停用帳號"><Trash2 size={18} /></button>}
                        <button onClick={handleUpdateCustomerByAdmin} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">儲存變更</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm text-stone-600 bg-stone-50 p-4 rounded-xl mt-4">
                      <div>
                        <span className="text-xs font-bold text-stone-400 block mb-1">會員 Email</span>
                        <span className="font-mono text-xs font-bold text-stone-800 break-all">{selectedCustomer.email || '（無）'}</span>
                      </div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">性別</span><span className="font-bold">{selectedCustomer.gender || '-'}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">手機號碼</span><span className="font-bold">{selectedCustomer.phone}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">Line ID</span><span className="font-bold text-[#06C755]">{selectedCustomer.lineId || '（無）'}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">聯絡地址</span><span className="font-bold">{selectedCustomer.address || '（無）'}</span></div>
                      <div className="pt-3 mt-1 border-t border-stone-200">
                        <span className="text-xs font-bold text-stone-400 block mb-1">個資同意紀錄</span>
                        {selectedCustomer.electronicPrivacyConsent === 'none' ? (
                          <p className="text-xs text-amber-800 font-bold">未提供電子個資同意</p>
                        ) : selectedCustomer.privacyConsentAt || selectedCustomer.privacyConsentVersion ? (
                          <div className="text-xs text-stone-600 space-y-1">
                            <p>
                              <span className="font-bold text-teal-700">已同意</span>
                              {selectedCustomer.privacyConsentVersion
                                ? `· 版本 v${selectedCustomer.privacyConsentVersion}`
                                : ''}
                            </p>
                            {formatConsentAt(selectedCustomer.privacyConsentAt) && (
                              <p className="text-stone-500">{formatConsentAt(selectedCustomer.privacyConsentAt)}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400">尚無同意紀錄（可能為舊客戶或線下同意）</p>
                        )}
                      </div>

                      {selectedCustomer.role === 'deleted' && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <p className="text-xs text-rose-600 font-bold mb-3 text-center bg-rose-50 py-2 rounded-lg">此客戶已停用</p>
                          <button onClick={handleRestoreCustomer} className="w-full bg-emerald-500 text-white font-bold py-2 rounded-md shadow-sm hover:bg-emerald-600 transition-colors flex justify-center items-center gap-1">
                            還原客戶資料
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
                  <h3 className="font-bold text-stone-800">歷史訂單</h3>
                  <div className="flex gap-2">
                    {isMergeMode && mergeSelection.length > 0 && <button onClick={handleConfirmMerge} className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md hover:bg-purple-700 transition-colors flex items-center gap-1"><LinkIcon size={14} /> 確認合併 ({mergeSelection.length})</button>}
                    {selectedCustomer.role !== 'deleted' && (
                      <button onClick={() => { setIsMergeMode(!isMergeMode); setMergeSelection([]) }} className={`text-xs font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${isMergeMode ? 'bg-stone-200 text-stone-600' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                        <LinkIcon size={14} /> {isMergeMode ? '取消合併' : '合併待確認訂單'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pb-10">
                  {[...allOrders, ...oldOrders].filter((o) => o.userId === selectedCustomer.id).length === 0 ? (
                    <p className="text-center text-stone-400 py-10 bg-white rounded-2xl border border-stone-200 border-dashed">尚未有訂單紀錄</p>
                  ) : (
                    [...allOrders, ...oldOrders].filter((o) => o.userId === selectedCustomer.id).map((order) => {
                      const canMerge = isMergeMode && (order.status === 'pending' || order.status === 'confirming')
                      const isSelectedForMerge = mergeSelection.includes(order.id)
                      return (
                        <div key={order.id} onClick={() => { if (canMerge) handleToggleMergeOrder(order.id) }} className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all ${canMerge ? 'cursor-pointer hover:border-purple-300' : 'border-stone-200'} ${isSelectedForMerge ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            {isMergeMode && <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelectedForMerge ? 'bg-purple-600 border-purple-600 text-white' : (canMerge ? 'border-stone-300 bg-white' : 'border-stone-200 bg-stone-100 opacity-50')}`}>{isSelectedForMerge && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}</div>}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-blue-600 hover:text-blue-800 text-lg tracking-wide cursor-pointer underline" onClick={(e) => { e.stopPropagation(); setOrderSearchId(order.id); setOrderStatusFilter('all'); setShowAdminOrders(true); navigate('/admin/orders') }}>{order.id}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusMap[order.status]?.color || 'bg-stone-100'}`}>{statusMap[order.status]?.label}</span>
                                {order.createdByAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded inline-block ml-1">代下</span>}
                              </div>
                              <p className="text-xs text-stone-400 mt-1">{order.createdAt?.toDate().toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-amber-600 text-xl mt-1">${order.totals.finalPrice}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
