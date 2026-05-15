import { X } from '../Icons'
import { PAYMENT_METHOD_OPTIONS } from '../../constants/paymentMethod'

export default function PaymentConfirmModal({
  order,
  paymentMethod,
  setPaymentMethod,
  paymentNote,
  setPaymentNote,
  onConfirm,
  onCancel
}) {
  if (!order) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#Fdfbf7] rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-5 relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 text-stone-400 hover:bg-stone-100 p-1 rounded-full"
          aria-label="關閉"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-black text-stone-800 mb-1 pr-8">標記為已付款</h3>
        <p className="text-sm text-stone-600 mb-4">
          訂單 <span className="font-mono font-bold">{order.id}</span> — 請填寫付款方式以便日後查帳。
        </p>
        <label className="block text-xs font-bold text-stone-500 mb-1">
          付款方式 <span className="text-rose-500">*</span>
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500 mb-3"
        >
          <option value="">請選擇</option>
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <label className="block text-xs font-bold text-stone-500 mb-1">備註（選填）</label>
        <textarea
          value={paymentNote}
          onChange={(e) => setPaymentNote(e.target.value)}
          placeholder="例如：匯款後五碼、LINE 暱稱、收據編號"
          rows={2}
          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 mb-4"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg font-bold text-stone-600 bg-stone-100 hover:bg-stone-200"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg font-bold text-white bg-amber-500 hover:bg-amber-600"
          >
            確認已付款
          </button>
        </div>
      </div>
    </div>
  )
}
