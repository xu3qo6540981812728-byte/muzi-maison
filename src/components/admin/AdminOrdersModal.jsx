import {
  ClipboardList,
  DownloadIcon,
  Printer,
  SearchIcon,
  X
} from '../Icons'

import OrderTable from './OrderTable'

export default function AdminOrdersModal({
  onClose,
  handlePrintConfirmedOrders,
  orderSearchId,
  setOrderSearchId,
  handleCloudSearch,
  setCloudSearchResult,
  setActiveSearchId,
  orderStatusFilter,
  setOrderStatusFilter,
  orderStartDate,
  setOrderStartDate,
  orderEndDate,
  setOrderEndDate,
  downloadOrdersCSV,
  filteredAdminOrders,
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
  saveOrderNote,
  loadMoreOldOrders
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
      <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-6xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-stone-200 pb-3 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-stone-800 flex items-center gap-2">
            <ClipboardList size={24} className="text-amber-600" /> 訂單管理中心
          </h2>

          <button
            onClick={handlePrintConfirmedOrders}
            className="flex items-center justify-center gap-2 bg-stone-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-stone-700 transition-colors active:scale-95"
          >
            <Printer size={18} /> 列印出貨單
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 flex-1 min-w-[200px]">
            <SearchIcon size={16} className="text-stone-400" />
            <input
              type="text"
              placeholder="輸入單號後按 Enter 雲端搜尋..."
              value={orderSearchId}
              onChange={(e) => {
                setOrderSearchId(e.target.value)
                if (e.target.value === '') {
                  setCloudSearchResult(null)
                  setActiveSearchId('')
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCloudSearch()}
              className="w-full text-sm outline-none font-bold tracking-wider"
            />
            <button
              onClick={handleCloudSearch}
              className="bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-stone-700 transition-colors shadow-sm shrink-0 active:scale-95"
            >
              搜尋
            </button>
          </div>

          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="bg-white px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold text-stone-600 outline-none flex-1 min-w-[120px] cursor-pointer"
          >
            <option value="all">所有狀態</option>
            {Object.entries(statusMap).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 flex-1 min-w-[250px]">
            <input
              type="date"
              value={orderStartDate}
              onChange={(e) => setOrderStartDate(e.target.value)}
              className="text-sm outline-none text-stone-600 cursor-pointer"
            />
            <span className="text-stone-400">-</span>
            <input
              type="date"
              value={orderEndDate}
              onChange={(e) => setOrderEndDate(e.target.value)}
              className="text-sm outline-none text-stone-600 cursor-pointer"
            />
          </div>

          <button
            onClick={downloadOrdersCSV}
            className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors shadow-sm active:scale-95 min-w-[120px]"
          >
            <DownloadIcon size={16} /> 下載明細
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAdminOrders.length === 0 ? (
            <p className="text-center text-stone-400 mt-10">找不到符合條件的訂單</p>
          ) : (
            <OrderTable
              orders={filteredAdminOrders}
              statusMap={statusMap}
              updateOrderStatus={updateOrderStatus}
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
          )}

          <div className="col-span-full flex justify-center mt-6 mb-8">
            <button
              onClick={loadMoreOldOrders}
              className="bg-stone-200 text-stone-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-300 transition-colors shadow-sm active:scale-95"
            >
              載入更早的訂單...
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

