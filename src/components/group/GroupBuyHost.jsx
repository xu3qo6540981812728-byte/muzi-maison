import { Link } from 'react-router-dom'
import { UsersIcon, Copy, ClipboardList } from '../Icons'
import { aggregateGroupLines } from '../../utils/groupBuy'

export default function GroupBuyHost({
  sessionId,
  sessionDoc,
  lines,
  products,
  currentUser,
  onCopyJoinLink,
  onCancelGroupBuy
}) {
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/group/join/${sessionId}`
      : ''

  const isAnonymousVisitor = currentUser?.isAnonymous === true
  const isOwner =
    sessionDoc &&
    currentUser &&
    !isAnonymousVisitor &&
    sessionDoc.ownerUid === currentUser.uid
  const status = sessionDoc?.status
  const isActive = status === 'active'
  const { cart: aggCart, labels: aggLabels } = aggregateGroupLines(lines)
  const rows = Object.keys(aggCart).map((pid) => ({
    productId: pid,
    name: products.find((p) => p.id === pid)?.name || pid,
    qty: aggCart[pid],
    label: aggLabels[pid] || ''
  }))

  if (!sessionDoc) {
    return (
      <div className="min-h-screen bg-[#Fdfbf7] flex items-center justify-center p-6">
        <p className="text-stone-500 font-bold">載入揪團資料中...</p>
      </div>
    )
  }

  if (sessionDoc.missing) {
    return (
      <div className="min-h-screen bg-[#Fdfbf7] flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-stone-700 font-black">找不到此揪團連結</p>
        <p className="text-sm text-stone-500 text-center">此團購已失效或連結錯誤。</p>
        <Link to="/" className="text-amber-700 font-bold underline">
          回到首頁
        </Link>
      </div>
    )
  }

  const endedMessage =
    status === 'cancelled'
      ? '此團購已由主揪取消，連結已失效。'
      : status === 'checked_out'
        ? '此團購已結束（主揪已結帳），連結已失效。'
        : '此揪團已結束。'

  return (
    <div className="min-h-screen bg-[#Fdfbf7] p-4 md:p-8">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-stone-100 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
          <UsersIcon size={24} className="text-amber-600 shrink-0" />
          <h1 className="text-xl font-black text-stone-800">揪團購物（主揪）</h1>
        </div>

        {!currentUser && (
          <p className="text-sm text-amber-800 font-bold mb-4">
            請先登入<strong className="font-black">主揪會員帳號</strong>
            後再管理揪團。
          </p>
        )}
        {currentUser && isAnonymousVisitor && (
          <p className="text-sm text-amber-800 font-bold mb-4">
            目前為匿名瀏覽，無法擔任主揪。請登入<strong className="font-black">會員帳號</strong>
            ；若已自動登出匿名，請重新登入後再開啟本頁。
          </p>
        )}
        {currentUser && !isAnonymousVisitor && !isOwner && (
          <p className="text-sm text-rose-600 font-bold mb-4">你不是此揪團的主揪，無法操作。</p>
        )}

        <p className="text-xs text-stone-500 mb-3 leading-relaxed">
          複製下方連結給朋友；朋友會進入與平常相同的賣場選購（不需登入）。你和朋友的品項會即時合併在你的購物車，請由你從購物車統一結帳；送出訂單後此揪團即結束。
        </p>

        <div className="flex gap-2 mb-4">
          <input
            readOnly
            value={joinUrl}
            className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono"
          />
          <button
            type="button"
            disabled={!isActive}
            onClick={() => onCopyJoinLink(joinUrl)}
            className="shrink-0 bg-stone-800 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            <Copy size={14} /> 複製
          </button>
        </div>

        {isOwner && isActive && (
          <button
            type="button"
            onClick={() => onCancelGroupBuy?.()}
            className="w-full mb-4 py-3 rounded-2xl border-2 border-rose-200 bg-rose-50 text-rose-800 text-sm font-black hover:bg-rose-100 transition-colors"
          >
            取消揪團（連結將失效）
          </button>
        )}

        <div className="rounded-2xl border border-stone-200 overflow-hidden mb-4">
          <div className="bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600 flex items-center gap-2">
            <ClipboardList size={14} /> 揪團明細（即時）
          </div>
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-stone-400 text-center">尚無人選購</p>
          ) : (
            <ul className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
              {rows.map((r) => (
                <li key={r.productId} className="px-3 py-2.5 text-sm">
                  <div className="font-bold text-stone-800">{r.name}</div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    共 <span className="font-black text-amber-700">{r.qty}</span> 件（{r.label}）
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          to="/"
          className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-2xl shadow-md mb-3"
        >
          回到商店繼續選購
        </Link>

        <Link
          to="/cart"
          className="block text-center text-sm text-amber-800 font-bold hover:underline mb-2"
        >
          開啟購物車結帳 →
        </Link>

        {!isActive && (
          <p className="text-center text-xs text-amber-900 font-bold mb-2 px-1 leading-relaxed">{endedMessage}</p>
        )}
      </div>
    </div>
  )
}
