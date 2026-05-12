import {
  ChevronRight,
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
  filteredUsers,
  userLimit,
  setUserLimit,
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
  statusMap
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
      <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-6xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
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

        <div className="flex-1 overflow-y-auto">
          {!selectedCustomer ? (
            filteredUsers.length === 0 ? (
              <p className="text-center text-stone-400 mt-10">找不到客戶資料</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedCustomer({ ...user })}
                    className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden ${
                      user.role === 'deleted' ? 'border-rose-200 opacity-80' : 'border-stone-200 hover:border-blue-400'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 mt-2 ${user.role === 'deleted' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                      <UserIcon size={32} />
                    </div>
                    <h3 className="font-black text-stone-800 text-lg">
                      {user.name} <span className="text-sm font-normal text-stone-500">({user.gender || '-'})</span>
                    </h3>
                    {user.role === 'deleted' && <div className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1">已停用</div>}
                    <p className="text-sm text-stone-500 font-bold mt-1">{user.phone}</p>
                    <p
                      className="text-[11px] text-stone-400 font-mono mt-1 w-full px-1 truncate"
                      title={user.email || ''}
                    >
                      {user.email ? `註冊 ${user.email}` : '（無 Email 紀錄）'}
                    </p>
                    <span className="mt-3 text-[10px] bg-stone-100 text-stone-500 px-3 py-1 rounded-full font-bold">點擊查看詳細資料與訂單</span>
                  </div>
                ))}

                {filteredUsers.length >= userLimit && (
                  <div className="col-span-full flex justify-center mt-6 mb-8">
                    <button onClick={() => setUserLimit((prev) => prev + 50)} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-300 transition-colors">
                      載入更多客戶...
                    </button>
                  </div>
                )}
              </div>
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
                    <button onClick={() => startAdminOrder(selectedCustomer)} className="w-full mt-3 mb-2 bg-amber-500 text-white font-bold py-2.5 rounded-md shadow-sm hover:bg-amber-600 transition-colors flex justify-center items-center gap-2">
                      <ShoppingCart size={18} /> 幫客戶代建單
                    </button>
                  )}

                  {isEditingAdminCustomer ? (
                    <div className="space-y-3 text-sm bg-stone-50 p-4 rounded-xl border border-stone-200 mt-4">
                      <div className="rounded-md px-2 py-2 bg-white border border-stone-200 border-dashed">
                        <span className="text-[10px] font-bold text-stone-400 block mb-0.5">註冊 Email（登入帳號，僅供檢視）</span>
                        <span className="font-mono text-xs text-stone-700 break-all">{selectedCustomer.email || '（無紀錄，可能為舊資料）'}</span>
                      </div>
                      <input type="text" placeholder="姓名" value={selectedCustomer.name} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="男" checked={selectedCustomer.gender === '男'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />男</label>
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="女" checked={selectedCustomer.gender === '女'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />女</label>
                      </div>
                      <input type="tel" placeholder="聯絡電話" value={selectedCustomer.phone} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <input type="text" placeholder="Line ID" value={selectedCustomer.lineId} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, lineId: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <textarea placeholder="聯絡地址" value={selectedCustomer.address} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })} rows="2" className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400"></textarea>

                      <div className="flex gap-2">
                        {!isNewCustomer && <button onClick={handleDeleteCustomer} className="bg-red-100 text-red-600 font-bold px-3 py-2 rounded-md hover:bg-red-200 transition-colors" title="刪除客戶"><Trash2 size={18} /></button>}
                        <button onClick={handleUpdateCustomerByAdmin} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">儲存修改</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm text-stone-600 bg-stone-50 p-4 rounded-xl mt-4">
                      <div>
                        <span className="text-xs font-bold text-stone-400 block mb-1">註冊 Email</span>
                        <span className="font-mono text-xs font-bold text-stone-800 break-all">{selectedCustomer.email || '未提供'}</span>
                      </div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">性別</span><span className="font-bold">{selectedCustomer.gender || '-'}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">聯絡電話</span><span className="font-bold">{selectedCustomer.phone}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">Line ID</span><span className="font-bold text-[#06C755]">{selectedCustomer.lineId || '未提供'}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">預設地址</span><span className="font-bold">{selectedCustomer.address || '未提供'}</span></div>

                      {selectedCustomer.role === 'deleted' && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <p className="text-xs text-rose-600 font-bold mb-3 text-center bg-rose-50 py-2 rounded-lg">⚠️ 此帳號目前為停用狀態</p>
                          <button onClick={handleRestoreCustomer} className="w-full bg-emerald-500 text-white font-bold py-2 rounded-md shadow-sm hover:bg-emerald-600 transition-colors flex justify-center items-center gap-1">
                            恢復帳號權限
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
                        <LinkIcon size={14} /> {isMergeMode ? '取消合併模式' : '合併未處理訂單'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pb-10">
                  {[...allOrders, ...oldOrders].filter((o) => o.userId === selectedCustomer.id).length === 0 ? (
                    <p className="text-center text-stone-400 py-10 bg-white rounded-2xl border border-stone-200 border-dashed">尚無訂單紀錄</p>
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
                                {order.createdByAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded inline-block ml-1">代建</span>}
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
