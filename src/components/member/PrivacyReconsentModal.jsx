import PrivacyConsentBlock from '../register/PrivacyConsentBlock'

/** 政策版本更新後，強制舊會員重新閱讀並同意 */
export default function PrivacyReconsentModal({
  privacySettings,
  understood,
  setUnderstood,
  agreed,
  setAgreed,
  onSubmit,
  submitting,
  currentVersion,
  userVersion
}) {
  const canSubmit = understood && agreed && !submitting

  return (
    <div className="fixed inset-0 z-[70] flex justify-center items-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="bg-brand-marble rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-stone-200 p-6 md:p-8">
        <h2 className="text-lg font-black text-stone-800 mb-2">個人資料政策已更新</h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-1">
          我們已更新《個人資料保護暨隱私權政策》及同意書（目前版本 v{currentVersion}
          {userVersion ? `，您先前同意版本 v${userVersion}` : '，您尚未留存同意紀錄'}）。
        </p>
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          依個資法規定，請您重新閱讀並勾選同意後，方可繼續購物與結帳。
        </p>

        <PrivacyConsentBlock
          privacySettings={privacySettings}
          understood={understood}
          setUnderstood={setUnderstood}
          agreed={agreed}
          setAgreed={setAgreed}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="auth-btn-primary w-full font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
        >
          {submitting ? '儲存中…' : '我已完成閱讀並同意，繼續購物'}
        </button>
      </div>
    </div>
  )
}
