import { ArrowUp, ClipboardList, TrendingUp, X } from '../Icons'

export default function AdminDashboardModal({
  onClose,
  onGoToOrders,
  onOpenLogs,
  allOrders,
  allUsers,
  products,
  monthlyStats,
  db,
  statusMap
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
      <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-5xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b border-stone-200 pb-3">
          <TrendingUp size={24} className="text-indigo-600" /> 營運數據儀表板
        </h2>
        <div className="mb-4 flex justify-end">
          <button
            onClick={onOpenLogs}
            className="text-xs bg-stone-800 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-stone-900 transition-colors"
          >
            查看管理操作紀錄
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {(() => {
            // --- 數據核心計算邏輯開始 ---
            const now = new Date()
            const currentMonth = now.getMonth()
            const currentYear = now.getFullYear()

            let monthlyRevenue = 0
            let monthlyCost = 0
            let statusCounts = {
              pending: 0,
              confirming: 0,
              confirmed: 0,
              shipped: 0,
              completed: 0,
              cancelled: 0
            }
            let itemSales = {}
            let newUsersThisMonth = 0

            // 計算訂單數據
            allOrders.forEach((order) => {
              const orderDate = order.createdAt ? order.createdAt.toDate() : new Date()
              const isThisMonth =
                orderDate.getMonth() === currentMonth &&
                orderDate.getFullYear() === currentYear

              if (statusCounts[order.status] !== undefined) statusCounts[order.status]++

              // 僅限本月且計算已確認/已出貨/已完成
              if (isThisMonth && ['confirmed', 'shipped', 'completed'].includes(order.status)) {
                monthlyRevenue += order.totals.finalPrice || 0
                monthlyCost += order.totals.totalCost || 0
              }
            })

            // 計算會員成長數據
            allUsers.forEach((user) => {
              if (user.createdAt) {
                const uDate = user.createdAt.toDate()
                if (uDate.getMonth() === currentMonth && uDate.getFullYear() === currentYear) newUsersThisMonth++
              }
            })

            // 讓排行榜直接讀取 monthlyStats.itemSales（舊邏輯相容）
            if (monthlyStats && monthlyStats.itemSales) {
              Object.entries(monthlyStats.itemSales).forEach(([itemId, data]) => {
                const prod = products.find((p) => p.id === itemId)
                const name = prod ? prod.name : itemId
                itemSales[name] = { qty: data.qty }
              })
            }

            const topItems = Object.entries(itemSales)
              .sort((a, b) => b[1].qty - a[1].qty)
              .slice(0, 5)

            const totalOrdersCount = Object.values(statusCounts).reduce((a, b) => a + b, 0)
            // --- 數據核心計算邏輯結束 ---

            return (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-center">
                    <span className="text-xs font-bold text-indigo-500 mb-1">本月總營收</span>
                    <span className="text-2xl md:text-3xl font-black text-stone-800">
                      ${(monthlyStats.monthlyRevenue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                    <span className="text-xs font-bold text-emerald-500 mb-1">本月預估毛利</span>
                    <span className="text-2xl md:text-3xl font-black text-stone-800">
                      ${(monthlyRevenue - monthlyCost).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                    <span className="text-xs font-bold text-blue-500 mb-1">本月新增會員</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-black text-stone-800">{newUsersThisMonth}</span>
                      <span className="text-xs text-stone-400 font-bold">/ 總數 {allUsers.length}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-center">
                    <span className="text-xs font-bold text-amber-500 mb-1">未處理/確認中訂單</span>
                    <span className="text-2xl md:text-3xl font-black text-stone-800 text-amber-600">
                      {statusCounts.pending + statusCounts.confirming}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                      <h3 className="font-bold text-stone-800 flex items-center gap-2">
                        🏆 本月熱銷排行榜{' '}
                        <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded">
                          排除已取消
                        </span>
                      </h3>

                      <button
                        onClick={() => {
                          const totalItemsSold = Object.values(itemSales).reduce((sum, item) => sum + item.qty, 0)

                          const exportData = topItems.map(([name, data]) => {
                            const prod = products.find((p) => p.name === name) || {}
                            const percentage =
                              totalItemsSold > 0 ? Math.round((data.qty / totalItemsSold) * 100) : 0
                            return {
                              name,
                              image: prod.image || '',
                              percentage,
                              id: prod.id || ''
                            }
                          })

                          if (db) {
                            db.collection('settings').doc('topSellers').set({ items: exportData, label: '本月' })
                            alert('✅ 已成功將最新排行榜發佈至首頁！')
                          }
                        }}
                        className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1 active:scale-95"
                      >
                        <ArrowUp size={14} /> 發佈至首頁
                      </button>
                    </div>

                    {topItems.length === 0 ? (
                      <p className="text-sm text-stone-400 text-center py-6">本月尚無銷售數據</p>
                    ) : (
                      <div className="space-y-4">
                        {topItems.map(([name, data], idx) => {
                          const maxQty = topItems[0][1].qty
                          const percentage = Math.round((data.qty / maxQty) * 100)
                          return (
                            <div key={name} className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="font-bold text-stone-700 truncate pr-2">
                                  <span className="text-stone-400 mr-1">#{idx + 1}</span> {name}
                                </span>
                                <span className="font-bold text-indigo-600 shrink-0">{data.qty} 件</span>
                              </div>
                              <div className="w-full bg-stone-100 rounded-full h-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                      <h3 className="font-bold text-stone-800 flex items-center gap-2">
                        📊 系統總訂單狀態分佈{' '}
                        <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded">
                          全部時間
                        </span>
                      </h3>

                      <button
                        onClick={onGoToOrders}
                        className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors flex items-center gap-1 active:scale-95"
                      >
                        前往管理 ➔
                      </button>
                    </div>

                    {totalOrdersCount === 0 ? (
                      <p className="text-sm text-stone-400 text-center py-6">尚無訂單數據</p>
                    ) : (
                      <div className="space-y-3">
                        {[
                          { key: 'pending', label: '未處理', color: 'bg-rose-500' },
                          { key: 'confirming', label: '確認中 (已傳後五碼)', color: 'bg-amber-500' },
                          { key: 'confirmed', label: '已確認 (待出貨)', color: 'bg-blue-500' },
                          { key: 'shipped', label: '已出貨', color: 'bg-purple-500' },
                          { key: 'completed', label: '已完成', color: 'bg-emerald-500' }
                        ].map((status) => {
                          const count = statusCounts[status.key] || 0
                          const percentage = Math.round((count / totalOrdersCount) * 100)
                          return (
                            <div key={status.key} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-stone-600 w-28 shrink-0">{status.label}</span>
                              <div className="flex-1 bg-stone-100 rounded-full h-4 overflow-hidden flex relative">
                                <div className={`${status.color} h-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                {count > 0 && (
                                  <span className="absolute inset-y-0 left-2 text-[9px] text-white font-bold flex items-center">
                                    {percentage}%
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-bold text-stone-700 w-8 text-right shrink-0">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

