import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const target = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/components/admin/AdminCustomersModal.jsx'
)

const s = {
  title: '\u5ba2\u6236\u7ba1\u7406',
  searchPh: '\u641c\u5c0b\u59d3\u540d\u3001\u96fb\u8a71\u6216 Email',
  showDeleted: '\u67e5\u770b\u505c\u7528\u5ba2\u6236',
  showActive: '\u8fd4\u56de\u6b63\u5e38\u5ba2\u6236',
  addCustomer: '\u65b0\u589e\u5ba2\u6236',
  noMatch: '\u67e5\u7121\u7b26\u5408\u7684\u5ba2\u6236',
  disabled: '\u5df2\u505c\u7528',
  emailPrefix: 'Email\uff1a',
  noEmail: '\u7121 Email \u7d00\u9304',
  clickDetail: '\u9ede\u64ca\u67e5\u770b\u8a73\u7d30\u8cc7\u6599',
  loadMore: '\u8f09\u5165\u66f4\u591a\u5ba2\u6236...',
  back: '\u8fd4\u56de',
  edit: '\u7de8\u8f2f',
  cancel: '\u53d6\u6d88',
  proxyOrder: '\u5e6b\u5ba2\u6236\u4ee3\u5efa\u55ae',
  downloadPdf: '\u4e0b\u8f09\u500b\u8cc7\u540c\u610f\u66f8 PDF',
  regEmailLabel: '\u8a3b\u518a Email\uff08\u767b\u5165\u5e33\u865f\uff0c\u50c5\u4f9b\u6aa2\u8996\uff09',
  noEmailRecord: '\uff08\u7121\u7d00\u9304\uff0c\u53ef\u80fd\u70ba\u820a\u8cc7\u6599\uff09',
  namePh: '\u59d3\u540d',
  male: '\u7537',
  female: '\u5973',
  phonePh: '\u806f\u7d61\u96fb\u8a71',
  addressPh: '\u806f\u7d61\u5730\u5740',
  deleteTitle: '\u522a\u9664\u5ba2\u6236',
  save: '\u5132\u5b58\u4fee\u6539',
  regEmail: '\u8a3b\u518a Email',
  notProvided: '\u672a\u63d0\u4f9b',
  gender: '\u6027\u5225',
  phone: '\u806f\u7d61\u96fb\u8a71',
  defaultAddr: '\u9810\u8a2d\u5730\u5740',
  consentRecord: '\u500b\u8cc7\u540c\u610f\u7d00\u9304',
  noElectronic: '\u7121\u96fb\u5b50\u540c\u610f\uff08\u7ba1\u7406\u54e1\u4ee3\u5efa\uff09',
  agreed: '\u5df2\u540c\u610f',
  versionMid: '\u00b7 \u7248\u672c v',
  noConsent: '\u5c1a\u7121\u7d00\u9304\uff08\u53ef\u80fd\u70ba\u653f\u7b56\u5be6\u65bd\u524d\u8a3b\u518a\uff09',
  accountDisabled: '\u26a0\ufe0f \u6b64\u5e33\u865f\u76ee\u524d\u70ba\u505c\u7528\u72c0\u614b',
  restore: '\u6062\u5fa9\u5e33\u865f\u6b0a\u9650',
  orderHistory: '\u6b77\u53f2\u8a02\u55ae',
  confirmMerge: '\u78ba\u8a8d\u5408\u4f75',
  cancelMerge: '\u53d6\u6d88\u5408\u4f75\u6a21\u5f0f',
  mergeOrders: '\u5408\u4f75\u5f85\u8655\u7406\u8a02\u55ae',
  noOrders: '\u5c1a\u7121\u8a02\u55ae\u7d00\u9304',
  proxyBadge: '\u4ee3\u5efa'
}

const content = `import {
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
  statusMap,
  onDownloadPrivacyConsentPdf
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
      <div className="bg-brand-marble p-6 rounded-3xl shadow-2xl w-full max-w-6xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full">
          <X size={24} />
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-stone-200 pb-3 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-stone-800 flex items-center gap-2">
            <UsersIcon size={24} className="text-blue-600" /> ${s.title}
          </h2>
          {!selectedCustomer && (
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 flex-1 min-w-[200px]">
                <SearchIcon size={16} className="text-stone-400" />
                <input
                  type="text"
                  placeholder="${s.searchPh}"
                  value={customerSearchName}
                  onChange={(e) => setCustomerSearchName(e.target.value)}
                  className="w-full text-sm outline-none font-bold"
                />
              </div>
              <button
                onClick={() => setShowDeletedCustomers(!showDeletedCustomers)}
                className={\`text-sm font-bold px-3 py-2 rounded-lg shadow-sm transition-colors border \${
                  showDeletedCustomers
                    ? 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }\`}
              >
                {showDeletedCustomers ? '${s.showActive}' : '${s.showDeleted}'}
              </button>
              {!showDeletedCustomers && (
                <button
                  onClick={handleAddCustomerBtn}
                  className="bg-blue-600 text-white text-sm font-bold px-3 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus size={16} /> ${s.addCustomer}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedCustomer ? (
            filteredUsers.length === 0 ? (
              <p className="text-center text-stone-400 mt-10">${s.noMatch}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedCustomer({ ...user })}
                    className={\`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden \${
                      user.role === 'deleted' ? 'border-rose-200 opacity-80' : 'border-stone-200 hover:border-blue-400'
                    }\`}
                  >
                    <div className={\`w-16 h-16 rounded-full flex items-center justify-center mb-3 mt-2 \${user.role === 'deleted' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}\`}>
                      <UserIcon size={32} />
                    </div>
                    <h3 className="font-black text-stone-800 text-lg">
                      {user.name} <span className="text-sm font-normal text-stone-500">({user.gender || '-'})</span>
                    </h3>
                    {user.role === 'deleted' && (
                      <div className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1">${s.disabled}</div>
                    )}
                    <p className="text-sm text-stone-500 font-bold mt-1">{user.phone}</p>
                    <p
                      className="text-[11px] text-stone-400 font-mono mt-1 w-full px-1 truncate"
                      title={user.email || ''}
                    >
                      {user.email ? \`${s.emailPrefix}\${user.email}\` : '${s.noEmail}'}
                    </p>
                    <span className="mt-3 text-[10px] bg-stone-100 text-stone-500 px-3 py-1 rounded-full font-bold">${s.clickDetail}</span>
                  </div>
                ))}

                {filteredUsers.length >= userLimit && (
                  <div className="col-span-full flex justify-center mt-6 mb-8">
                    <button onClick={() => setUserLimit((prev) => prev + 50)} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-300 transition-colors">
                      ${s.loadMore}
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
                    <ChevronRight size={14} className="rotate-180" /> ${s.back}
                  </button>
                  <div className={\`w-20 h-20 rounded-full flex items-center justify-center mb-4 mt-4 mx-auto \${selectedCustomer.role === 'deleted' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}\`}>
                    <UserIcon size={40} />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-stone-800 text-2xl">{selectedCustomer.name}</h3>
                    {selectedCustomer.role !== 'deleted' &&
                      (!isEditingAdminCustomer ? (
                        <button onClick={() => { setIsEditingAdminCustomer(true) }} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-blue-100">
                          <EditIcon size={14} /> ${s.edit}
                        </button>
                      ) : (
                        <button onClick={() => { setIsEditingAdminCustomer(false); setSelectedCustomer(allUsers.find((u) => u.id === selectedCustomer.id)) }} className="text-xs font-bold text-stone-400 hover:text-stone-600">
                          ${s.cancel}
                        </button>
                      ))}
                  </div>

                  {selectedCustomer.role !== 'deleted' && !isEditingAdminCustomer && (
                    <>
                      <button onClick={() => startAdminOrder(selectedCustomer)} className="w-full mt-3 mb-2 bg-amber-500 text-white font-bold py-2.5 rounded-md shadow-sm hover:bg-amber-600 transition-colors flex justify-center items-center gap-2">
                        <ShoppingCart size={18} /> ${s.proxyOrder}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadPrivacyConsentPdf?.(selectedCustomer)}
                        className="w-full mb-2 bg-teal-600 text-white font-bold py-2.5 rounded-md shadow-sm hover:bg-teal-700 transition-colors flex justify-center items-center gap-2"
                      >
                        <DownloadIcon size={18} /> ${s.downloadPdf}
                      </button>
                    </>
                  )}

                  {isEditingAdminCustomer ? (
                    <div className="space-y-3 text-sm bg-stone-50 p-4 rounded-xl border border-stone-200 mt-4">
                      <div className="rounded-md px-2 py-2 bg-white border border-stone-200 border-dashed">
                        <span className="text-[10px] font-bold text-stone-400 block mb-0.5">${s.regEmailLabel}</span>
                        <span className="font-mono text-xs text-stone-700 break-all">{selectedCustomer.email || '${s.noEmailRecord}'}</span>
                      </div>
                      <input type="text" placeholder="${s.namePh}" value={selectedCustomer.name} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="${s.male}" checked={selectedCustomer.gender === '${s.male}'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />${s.male}</label>
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="${s.female}" checked={selectedCustomer.gender === '${s.female}'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />${s.female}</label>
                      </div>
                      <input type="tel" placeholder="${s.phonePh}" value={selectedCustomer.phone} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <input type="text" placeholder="Line ID" value={selectedCustomer.lineId} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, lineId: e.target.value })} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                      <textarea placeholder="${s.addressPh}" value={selectedCustomer.address} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })} rows="2" className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400"></textarea>

                      <div className="flex gap-2">
                        {!isNewCustomer && <button onClick={handleDeleteCustomer} className="bg-red-100 text-red-600 font-bold px-3 py-2 rounded-md hover:bg-red-200 transition-colors" title="${s.deleteTitle}"><Trash2 size={18} /></button>}
                        <button onClick={handleUpdateCustomerByAdmin} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">${s.save}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm text-stone-600 bg-stone-50 p-4 rounded-xl mt-4">
                      <div>
                        <span className="text-xs font-bold text-stone-400 block mb-1">${s.regEmail}</span>
                        <span className="font-mono text-xs font-bold text-stone-800 break-all">{selectedCustomer.email || '${s.notProvided}'}</span>
                      </div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">${s.gender}</span><span className="font-bold">{selectedCustomer.gender || '-'}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">${s.phone}</span><span className="font-bold">{selectedCustomer.phone}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">Line ID</span><span className="font-bold text-[#06C755]">{selectedCustomer.lineId || '${s.notProvided}'}</span></div>
                      <div><span className="text-xs font-bold text-stone-400 block mb-1">${s.defaultAddr}</span><span className="font-bold">{selectedCustomer.address || '${s.notProvided}'}</span></div>
                      <div className="pt-3 mt-1 border-t border-stone-200">
                        <span className="text-xs font-bold text-stone-400 block mb-1">${s.consentRecord}</span>
                        {selectedCustomer.electronicPrivacyConsent === 'none' ? (
                          <p className="text-xs text-amber-700 font-bold">${s.noElectronic}</p>
                        ) : selectedCustomer.privacyConsentAt || selectedCustomer.privacyConsentVersion ? (
                          <div className="text-xs text-stone-600 space-y-1">
                            <p>
                              <span className="font-bold text-teal-700">${s.agreed}</span>
                              {selectedCustomer.privacyConsentVersion
                                ? \` ${s.versionMid}\${selectedCustomer.privacyConsentVersion}\`
                                : ''}
                            </p>
                            {formatConsentAt(selectedCustomer.privacyConsentAt) && (
                              <p className="text-stone-500">{formatConsentAt(selectedCustomer.privacyConsentAt)}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400">${s.noConsent}</p>
                        )}
                      </div>

                      {selectedCustomer.role === 'deleted' && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <p className="text-xs text-rose-600 font-bold mb-3 text-center bg-rose-50 py-2 rounded-lg">${s.accountDisabled}</p>
                          <button onClick={handleRestoreCustomer} className="w-full bg-emerald-500 text-white font-bold py-2 rounded-md shadow-sm hover:bg-emerald-600 transition-colors flex justify-center items-center gap-1">
                            ${s.restore}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
                  <h3 className="font-bold text-stone-800">${s.orderHistory}</h3>
                  <div className="flex gap-2">
                    {isMergeMode && mergeSelection.length > 0 && <button onClick={handleConfirmMerge} className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md hover:bg-purple-700 transition-colors flex items-center gap-1"><LinkIcon size={14} /> ${s.confirmMerge} ({mergeSelection.length})</button>}
                    {selectedCustomer.role !== 'deleted' && (
                      <button onClick={() => { setIsMergeMode(!isMergeMode); setMergeSelection([]) }} className={\`text-xs font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 \${isMergeMode ? 'bg-stone-200 text-stone-600' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}\`}>
                        <LinkIcon size={14} /> {isMergeMode ? '${s.cancelMerge}' : '${s.mergeOrders}'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pb-10">
                  {[...allOrders, ...oldOrders].filter((o) => o.userId === selectedCustomer.id).length === 0 ? (
                    <p className="text-center text-stone-400 py-10 bg-white rounded-2xl border border-stone-200 border-dashed">${s.noOrders}</p>
                  ) : (
                    [...allOrders, ...oldOrders].filter((o) => o.userId === selectedCustomer.id).map((order) => {
                      const canMerge = isMergeMode && (order.status === 'pending' || order.status === 'confirming')
                      const isSelectedForMerge = mergeSelection.includes(order.id)
                      return (
                        <div key={order.id} onClick={() => { if (canMerge) handleToggleMergeOrder(order.id) }} className={\`bg-white p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all \${canMerge ? 'cursor-pointer hover:border-purple-300' : 'border-stone-200'} \${isSelectedForMerge ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50' : ''}\`}>
                          <div className="flex items-start gap-3">
                            {isMergeMode && <div className={\`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 \${isSelectedForMerge ? 'bg-purple-600 border-purple-600 text-white' : (canMerge ? 'border-stone-300 bg-white' : 'border-stone-200 bg-stone-100 opacity-50')}\`}>{isSelectedForMerge && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}</div>}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-blue-600 hover:text-blue-800 text-lg tracking-wide cursor-pointer underline" onClick={(e) => { e.stopPropagation(); setOrderSearchId(order.id); setOrderStatusFilter('all'); setShowAdminOrders(true); navigate('/admin/orders') }}>{order.id}</span>
                                <span className={\`px-2 py-0.5 rounded text-xs font-bold \${statusMap[order.status]?.color || 'bg-stone-100'}\`}>{statusMap[order.status]?.label}</span>
                                {order.createdByAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded inline-block ml-1">${s.proxyBadge}</span>}
                              </div>
                              <p className="text-xs text-stone-400 mt-1">{order.createdAt?.toDate().toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-amber-600 text-xl mt-1">\${order.totals.finalPrice}</div>
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
`

fs.writeFileSync(target, content, 'utf8')

const verify = fs.readFileSync(target, 'utf8')
console.log('has title:', verify.includes(s.title))
console.log('?? runs:', (verify.match(/\?{2,}/g) || []).length)
console.log('motion left:', /<motion/.test(verify))
