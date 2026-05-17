import { useEffect, useMemo, useState } from 'react'

import { X } from '../Icons'

import { getDefaultPrivacySettings, mergePrivacySettings } from '../../constants/privacyPolicyDefaults'



function formatTodayYmd() {

  const d = new Date()

  const y = d.getFullYear()

  const m = String(d.getMonth() + 1).padStart(2, '0')

  const day = String(d.getDate()).padStart(2, '0')

  return `${y}-${m}-${day}`

}



function bumpPatchVersion(version) {

  const raw = String(version || '1.0').trim()

  const m = raw.match(/^(\d+)\.(\d+)$/)

  if (m) return `${m[1]}.${Number(m[2]) + 1}`

  const n = parseInt(raw, 10)

  if (!Number.isNaN(n)) return `${n + 1}.0`

  return '1.1'

}



function draftEqualsSaved(draft, saved) {

  const a = mergePrivacySettings(draft)

  const b = mergePrivacySettings(saved)

  return (

    a.version === b.version &&

    a.effectiveDate === b.effectiveDate &&

    a.businessName === b.businessName &&

    a.responsiblePerson === b.responsiblePerson &&

    a.jurisdictionCourt === b.jurisdictionCourt &&

    a.checkboxUnderstandLabel === b.checkboxUnderstandLabel &&

    a.checkboxAgreeLabel === b.checkboxAgreeLabel &&

    a.privacyPolicyBody === b.privacyPolicyBody &&

    a.consentFormBody === b.consentFormBody

  )

}



export default function AdminPrivacyModal({ onClose, privacyData, onSave, saving }) {

  const saved = useMemo(() => mergePrivacySettings(privacyData), [privacyData])

  const [draft, setDraft] = useState(() => mergePrivacySettings(privacyData))



  useEffect(() => {

    setDraft(mergePrivacySettings(privacyData))

  }, [privacyData])



  const isDirty = useMemo(() => !draftEqualsSaved(draft, saved), [draft, saved])



  const tryClose = () => {

    if (isDirty) {

      if (!window.confirm('尚有未儲存的修改，確定要關閉嗎？')) return

    }

    onClose()

  }



  const handleResetDefaults = () => {

    if (!window.confirm('確定要還原為系統預設政策全文？（尚未儲存的其他修改將一併覆蓋）')) return

    setDraft(getDefaultPrivacySettings())

  }



  const handleSave = () => {

    if (!draft.privacyPolicyBody?.trim() || !draft.consentFormBody?.trim()) {

      return alert('隱私權政策與同意書全文不可為空')

    }



    const contentChanged =

      draft.privacyPolicyBody !== saved.privacyPolicyBody ||

      draft.consentFormBody !== saved.consentFormBody ||

      draft.checkboxUnderstandLabel !== saved.checkboxUnderstandLabel ||

      draft.checkboxAgreeLabel !== saved.checkboxAgreeLabel ||

      draft.businessName !== saved.businessName ||

      draft.responsiblePerson !== saved.responsiblePerson ||

      draft.jurisdictionCourt !== saved.jurisdictionCourt



    const nextVersion = contentChanged ? bumpPatchVersion(saved.version) : saved.version

    const nextEffectiveDate = formatTodayYmd()



    const willForceReconsent = nextVersion !== saved.version



    let confirmMsg =

      `將儲存為版本 v${nextVersion}，生效日 ${nextEffectiveDate}。\n\n`

    if (willForceReconsent) {

      confirmMsg +=

        '⚠️ 政策版本將更新，所有已註冊會員登入後須重新閱讀並同意，未完成前無法結帳。\n\n'

    }

    confirmMsg += '確定要儲存嗎？'

    if (!window.confirm(confirmMsg)) return



    onSave({

      ...draft,

      version: nextVersion,

      effectiveDate: nextEffectiveDate

    })

  }



  return (

    <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-8 py-6">

      <div className="bg-brand-marble rounded-3xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col border border-stone-100 relative">

        <button

          type="button"

          onClick={tryClose}

          className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full z-10"

        >

          <X size={22} />

        </button>



        <div className="p-6 border-b border-stone-200 shrink-0 pr-12">

          <h2 className="text-xl font-black text-stone-800">個資政策與同意書設定</h2>

          <p className="text-sm text-stone-500 mt-1">

            儲存時若政策內容有變更，系統會自動遞增版本號並更新生效日。已同意客戶的 PDF 仍保留同意當下快照。

          </p>

          {isDirty && (

            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">

              有未儲存的修改

            </p>

          )}

        </div>



        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <label className="block text-sm">

              <span className="font-bold text-stone-600 text-xs">政策版本（儲存時自動遞增）</span>

              <input

                type="text"

                readOnly

                value={draft.version}

                className="mt-1 w-full bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600"

              />

              <span className="text-[10px] text-stone-400 mt-0.5 block">目前上線：v{saved.version}</span>

            </label>

            <label className="block text-sm">

              <span className="font-bold text-stone-600 text-xs">生效日期（儲存時自動更新為今日）</span>

              <input

                type="date"

                value={draft.effectiveDate || formatTodayYmd()}

                onChange={(e) => setDraft({ ...draft, effectiveDate: e.target.value })}

                className="mt-1 w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"

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

            onClick={tryClose}

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


