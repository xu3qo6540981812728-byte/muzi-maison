/** 個資政策預設全文（管理員可於後台修改；首次無 Firestore 資料時使用） */

export const DEFAULT_PRIVACY_META = {
  version: '1.0',
  effectiveDate: '2026-05-17',
  businessName: '木子家 MUZI MAISON（個人工作室）',
  responsiblePerson: '李培智',
  jurisdictionCourt: '臺灣新北地方法院'
}

export const DEFAULT_CHECKBOX_LABELS = {
  understand:
    '我已閱讀並了解《個人資料保護暨隱私權政策》及《個人資料蒐集、處理及利用同意書》之內容（含個人資料境外傳輸之告知）。',
  agree:
    '我同意貴工作室依上述文件蒐集、處理及利用我的個人資料，並同意透過官方 LINE 接收新品、優惠及行銷活動訊息（得隨時取消）。'
}

export const DEFAULT_PRIVACY_POLICY_BODY = `一、前言
木子家 MUZI MAISON（個人工作室）（以下稱「本工作室」）重視您的個人資料保護。本政策說明本工作室如何依中華民國《個人資料保護法》（以下稱「個資法」）及其他相關法規，於您使用本工作室線上訂單系統、會員服務、揪團購買功能及相關客服管道時，蒐集、處理、利用及保護您的個人資料。

二、個人資料控制者資訊
• 名稱：木子家 MUZI MAISON（個人工作室）
• 負責人：李培智
• 聯絡方式：以本網站「聯絡我們」所載之官方 LINE、聯絡電話、Email 為準
• 營業登記：目前尚無營業登記
• 統一發票：目前不提供統一發票

三、個人資料之蒐集類別
（一）識別類：姓名、性別、聯絡電話、電子郵件、LINE ID（若您提供）、收件／聯絡地址、會員帳號識別碼。
（二）帳號與驗證類：登入 Email、密碼（由 Google Firebase Authentication 儲存，本工作室無法讀取明文密碼）、匿名登入識別碼（揪團等功能使用時）。
（三）商業與交易類：訂單編號、商品品項、數量、金額、折扣、取貨方式、訂單備註、訂單狀態、付款方式及備註（後台確認用）、歷史購買紀錄。
（四）揪團購買相關：主揪及參與者姓名、電話、選購品項及數量。
（五）技術與紀錄類：IP 位址、瀏覽器類型、裝置資訊、操作紀錄、購物車及揪團工作階段之瀏覽器暫存資料。

四、蒐集目的
040 行銷、063 法定義務、069 契約關係、090 客戶管理與服務、091 消費者保護、098 商業與技術資訊、129 會計相關、136 資通安全、137 資通與資料庫管理、148 網路購物及其他電子商務服務、157 調查統計與研究分析、181 其他合於營業項目之業務。

五、利用期間、地區、對象及方式
• 利用期間：會員關係存續期間及終了後，依所得稅法、稅捐稽徵法及相關規定保存交易紀錄（原則至少五年；法令另有規定者從其規定）。
• 利用地區： primarily 中華民國境內；因使用 Google Firebase、Netlify 等服務，資料可能傳輸至境外（含美國）。
• 利用對象：本工作室授權人員、Google Firebase／Netlify 等雲端服務提供者、依法有權機關。目前無委外物流及委外記帳。
• 利用方式：自動化系統處理、人工查閱、以電話、Email、LINE 等方式聯繫。

六、國際傳輸
您知悉並同意，個人資料得因雲端服務傳輸至中華民國境外，本工作室將依個資法第 21 條採取適當保護措施。

七、當事人權利
您得依個資法第 3 條行使查詢、閱覽、複製、補充、更正、停止處理、刪除等權利，請透過「聯絡我們」提出，本工作室將於 15 日內回覆。

八、不提供資料之影響
若拒絕提供完成交易所必要之資料，本工作室將無法受理訂單或提供完整服務。

九、資料安全措施
包含 Firebase 身分驗證、Firestore 安全規則、HTTPS 傳輸、內部權限控管及操作日誌等。

十、Cookie 及類似技術
本網站使用 localStorage、sessionStorage 維持購物車及揪團狀態；關閉或清除瀏覽器資料可能影響使用體驗。

十一、兒童及青少年
未滿 18 歲者請於法定代理人同意後使用。

十二、政策修訂
本工作室得修訂本政策並於網站公告；重大變更將以適當方式通知。

十三、管轄法院
以臺灣新北地方法院為第一審管轄法院（消費者得依消費者保護法第 47 條選擇管轄）。`

export const DEFAULT_CONSENT_FORM_BODY = `個人資料蒐集、處理及利用同意書

本人使用木子家 MUZI MAISON 線上訂單系統前，已詳細閱讀並理解《個人資料保護暨隱私權政策》。

第一條　告知事項
本人確認已獲告知蒐集者名稱、蒐集目的、個人資料類別、利用期間／地區／對象／方式、當事人權利及不提供資料之影響。

第二條　同意範圍（必要）
本人同意本工作室為會員註冊、訂單處理、出貨／自取、款項確認、售後服務、揪團購買、資通安全及法令義務，蒐集、處理及利用本人之個人資料。

第三條　行銷推播（含於同意勾選）
本人同意本工作室為行銷目的，利用本人之姓名、電話、Email、LINE ID 及購買紀錄，透過官方 LINE、電話、Email 等方式發送新品、優惠及活動訊息。本人得隨時透過官方 LINE 或「聯絡我們」所列方式要求停止行銷利用。

第四條　跨境傳輸
本人同意個人資料得因 Firebase、Netlify 等服務傳輸至境外並依政策保護。

第五條　聲明
本人所提供資料為真實正確；若代他人提供已取得其同意；本人已年滿 18 歲或已取得法定代理人同意。

第六條　同意方式
於網站勾選同意並完成註冊，即視為電子化同意，與書面同意具有相同效力。`

export function getDefaultPrivacySettings() {
  return {
    ...DEFAULT_PRIVACY_META,
    privacyPolicyBody: DEFAULT_PRIVACY_POLICY_BODY,
    consentFormBody: DEFAULT_CONSENT_FORM_BODY,
    checkboxUnderstandLabel: DEFAULT_CHECKBOX_LABELS.understand,
    checkboxAgreeLabel: DEFAULT_CHECKBOX_LABELS.agree
  }
}

export function mergePrivacySettings(firestoreData) {
  const defaults = getDefaultPrivacySettings()
  if (!firestoreData || typeof firestoreData !== 'object') return defaults
  return {
    version: firestoreData.version || defaults.version,
    effectiveDate: firestoreData.effectiveDate || defaults.effectiveDate,
    businessName: firestoreData.businessName || defaults.businessName,
    responsiblePerson: firestoreData.responsiblePerson || defaults.responsiblePerson,
    jurisdictionCourt: firestoreData.jurisdictionCourt || defaults.jurisdictionCourt,
    privacyPolicyBody: firestoreData.privacyPolicyBody || defaults.privacyPolicyBody,
    consentFormBody: firestoreData.consentFormBody || defaults.consentFormBody,
    checkboxUnderstandLabel:
      firestoreData.checkboxUnderstandLabel || defaults.checkboxUnderstandLabel,
    checkboxAgreeLabel: firestoreData.checkboxAgreeLabel || defaults.checkboxAgreeLabel
  }
}

export function buildPolicySnapshot(privacySettings) {
  const s = mergePrivacySettings(privacySettings)
  return {
    version: s.version,
    effectiveDate: s.effectiveDate,
    businessName: s.businessName,
    responsiblePerson: s.responsiblePerson,
    jurisdictionCourt: s.jurisdictionCourt,
    privacyPolicyBody: s.privacyPolicyBody,
    consentFormBody: s.consentFormBody,
    checkboxUnderstandLabel: s.checkboxUnderstandLabel,
    checkboxAgreeLabel: s.checkboxAgreeLabel
  }
}
