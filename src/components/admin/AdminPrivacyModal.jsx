import { useEffect, useMemo, useState } from 'react'
import { X } from '../Icons'
import { getDefaultPrivacySettings, mergePrivacySettings } from '../../constants/privacyPolicyDefaults'

function bumpPrivacyVersion(currentVersion) {
  const raw = String(currentVersion || '1.0').trim()
  const m = raw.match(/^(\d+)\.(\d+)$/)
  if (m) return `${m[1]}.${Number(m[2]) + 1}`
  const n = Number(raw)
  if (!Number.isNaN(n)) return String(n + 1)
  return '1.1'
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function AdminPrivacyModal({ onClose, privacyData, onSave, saving }) {
  const [draft, setDraft] = useState(() => mergePrivacySettings(privacyData))

  useEffect(() => {
    setDraft(mergePrivacySettings(privacyData))
  }, [privacyData])

  const isDirty = useMemo(() => {
    const base = mergePrivacySettings(privacyData)
    return JSON.stringify(draft) !== JSON.stringify(base)
  }, [draft, privacyData])

  useEffect(() => {
    if (!isDirty) return undefined
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const requestClose = () => {
    if (isDirty && !window.confirm('尚有未儲存的修改，確定要離開嗎？')) return
    onClose()
  }

  const handleResetDefaults = () => {
    if (!window.confirm('確定要還原為系統預設政策全文？（尚未儲存的其他修改將一併覆蓋）')) return
    setDraft(getDefaultPrivacySettings())
  }

  const handleSave = () => {
    if (!draft.version?.trim()) return alert('請填寫政策版本號')
    if (!draft.privacyPolicyBody?.trim() || !draft.consentFormBody?.trim()) {
      return alert('隱私權政策與同意書全文不可為空')
    }
    if (
      !window.confirm(
        '儲存後將更新政策版本與生效日期，並要求已同意之舊會員重新閱讀並同意。確定要儲存嗎？'
      )
    ) {
      return
    }
    const nextVersion = bumpPrivacyVersion(privacyData?.version || draft.version)
    const nextDate = todayIsoDate()
    onSave({
      ...draft,
      version: nextVersion,
      effectiveDate: nextDate
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-8 py-6">
      <div className="bg-brand-marble rounded-3xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col border border-stone-100 relative">
        <button
          type="button"
          onClick={requestClose}
          className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full z-10"
        >
          <X size={22} />
        </button>

        <div className="p-6 border-b border-stone-200 shrink-0 pr-12">
          <h2 className="text-xl font-black text-stone-800">個資政策與同意書設定</h2>
          <p className="text-sm text-stone-500 mt-1">
            修改後將套用於新註冊客戶；儲存時會自動遞增版本並更新生效日期，已同意之舊會員須重新同意。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-bold text-stone-600 text-xs">政策版本（儲存時自動遞增）</span>
              <input
                type="text"
                value={draft.version}
                onChange={(e) => setDraft({ ...draft, version: e.target.value })}
                className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                placeholder="例：1.0"
              />
            </label>
            <label className="block text-sm">
              <span className="font-bold text-stone-600 text-xs">生效日期（儲存時自動更新為今日）</span>
              <input
                type="text"
                value={draft.effectiveDate}
                onChange={(e) => setDraft({ ...draft, effectiveDate: e.target.value })}
                className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                placeholder="例：2026-05-17"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="font-bold text-stone-600 text-xs">工作室名稱</span>
              <input
                type="text"
                value={draft.businessName}
                onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </label>
            <label className="block text-sm">
              <span className="font-bold text-stone-600 text-xs">負責人</span>
              <input
                type="text"
                value={draft.responsiblePerson}
                onChange={(e) => setDraft({ ...draft, responsiblePerson: e.target.value })}
                className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </label>
            <label className="block text-sm">
              <span className="font-bold text-stone-600 text-xs">管轄法院</span>
              <input
                type="text"
                value={draft.jurisdictionCourt}
                onChange={(e) => setDraft({ ...draft, jurisdictionCourt: e.target.value })}
                className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-bold text-stone-600 text-xs">「了解」勾選文案</span>
            <textarea
              rows={2}
              value={draft.checkboxUnderstandLabel}
              onChange={(e) => setDraft({ ...draft, checkboxUnderstandLabel: e.target.value })}
              className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </label>
          <label className="block text-sm">
            <span className="font-bold text-stone-600 text-xs">「同意」勾選文案（含行銷 LINE）</span>
            <textarea
              rows={2}
              value={draft.checkboxAgreeLabel}
              onChange={(e) => setDraft({ ...draft, checkboxAgreeLabel: e.target.value })}
              className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label className="block text-sm">
            <span className="font-bold text-stone-600 text-xs">《個人資料保護暨隱私權政策》全文</span>
            <textarea
              rows={14}
              value={draft.privacyPolicyBody}
              onChange={(e) => setDraft({ ...draft, privacyPolicyBody: e.target.value })}
              className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono leading-relaxed"
            />
          </label>
          <label className="block text-sm">
            <span className="font-bold text-stone-600 text-xs">《個人資料蒐集、處理及利用同意書》全文</span>
            <textarea
              rows={10}
              value={draft.consentFormBody}
              onChange={(e) => setDraft({ ...draft, consentFormBody: e.target.value })}
              className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono leading-relaxed"
            />
          </label>
        </div>

        <div className="p-4 border-t border-stone-200 flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-stone-100 text-stone-600 hover:bg-stone-200"
          >
            還原預設
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={requestClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-stone-100 text-stone-600 hover:bg-stone-200"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? '儲存中…' : '儲存政策'}
          </button>
        </div>
      </div>
    </div>
  )
}
