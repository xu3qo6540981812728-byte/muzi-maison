/** 非會員快速結帳（註冊）— 可捲動政策區＋雙勾選（勾選在捲動區外） */

function PolicySection({ title, body }) {
  if (!body) return null
  return (
    <section className="mb-4">
      <h4 className="text-xs font-black auth-heading mb-2">{title}</h4>
      <div className="text-[11px] text-stone-600 leading-relaxed whitespace-pre-wrap">{body}</div>
    </section>
  )
}

export default function PrivacyConsentBlock({
  privacySettings,
  understood,
  setUnderstood,
  agreed,
  setAgreed
}) {
  const version = privacySettings?.version || '1.0'
  const effectiveDate = privacySettings?.effectiveDate || ''
  const businessName = privacySettings?.businessName || '木子家 MUZI MAISON（個人工作室）'
  const responsiblePerson = privacySettings?.responsiblePerson || '李培智'

  return (
    <div className="mb-4 rounded-xl border auth-surface overflow-hidden">
      <div className="px-3 py-2 border-b auth-surface-header">
        <p className="text-xs font-black auth-heading">個人資料告知與同意（請詳閱）</p>
        <p className="text-[10px] text-[#7A6A58] mt-0.5">
          {businessName} · 負責人 {responsiblePerson} · 版本 v{version}
          {effectiveDate ? ` · ${effectiveDate}` : ''}
        </p>
      </div>

      <div
        className="max-h-48 overflow-y-auto px-3 py-3 bg-white text-stone-700 border-b border-[#E8DFD2]"
        role="region"
        aria-label="個人資料政策全文"
      >
        <PolicySection title="《個人資料保護暨隱私權政策》" body={privacySettings?.privacyPolicyBody} />
        <PolicySection title="《個人資料蒐集、處理及利用同意書》" body={privacySettings?.consentFormBody} />
      </div>

      <div className="px-3 py-3 space-y-2.5 auth-surface">
        <label className="flex items-start gap-2 cursor-pointer text-xs text-stone-700 leading-snug">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="mt-0.5 auth-accent-control shrink-0"
          />
          <span>{privacySettings?.checkboxUnderstandLabel}</span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer text-xs text-stone-700 leading-snug">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 auth-accent-control shrink-0"
          />
          <span>{privacySettings?.checkboxAgreeLabel}</span>
        </label>
      </div>
    </div>
  )
}
