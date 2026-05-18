import firebase from 'firebase/compat/app'
import { buildPolicySnapshot } from '../constants/privacyPolicyDefaults'

/** 與 Firestore 規則連動：同意當下寫入 _latest，供規則驗證 user 文件版本欄位 */
export const PRIVACY_CONSENT_LATEST_DOC = '_latest'

/** 寫入個資同意紀錄（註冊或政策更新重簽） */
export async function savePrivacyConsentForUser(db, uid, { customerSnapshot, privacySettings }) {
  if (!db || !uid) throw new Error('缺少資料庫或使用者')

  const consentId = `consent_${Date.now()}`
  const policySnapshot = buildPolicySnapshot(privacySettings)
  const consentRecord = {
    policyVersion: privacySettings.version,
    understood: true,
    agreed: true,
    marketingAgreed: true,
    customerSnapshot,
    policySnapshot,
    checkboxUnderstandLabel: privacySettings.checkboxUnderstandLabel,
    checkboxAgreeLabel: privacySettings.checkboxAgreeLabel,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    clientAgreedAt: new Date().toISOString(),
    agreedAt: firebase.firestore.FieldValue.serverTimestamp()
  }

  const userRef = db.collection('users').doc(uid)
  const batch = db.batch()
  batch.set(userRef.collection('privacyConsents').doc(consentId), consentRecord)
  batch.set(userRef.collection('privacyConsents').doc(PRIVACY_CONSENT_LATEST_DOC), consentRecord)
  batch.set(
    userRef,
    {
      privacyConsentVersion: privacySettings.version,
      privacyConsentAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  )
  await batch.commit()
  return consentId
}

export function userNeedsPrivacyReconsent(userProfile, privacySettings, { isAdmin, isAnonymous }) {
  if (isAnonymous || isAdmin) return false
  if (!userProfile || userProfile.role === 'admin' || userProfile.role === 'deleted') return false
  const currentVersion = String(privacySettings?.version || '').trim()
  if (!currentVersion) return false
  const userVersion = String(userProfile.privacyConsentVersion || '').trim()
  return !userVersion || userVersion !== currentVersion
}
