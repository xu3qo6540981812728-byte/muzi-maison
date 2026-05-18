import firebase from 'firebase/compat/app'
import { buildPolicySnapshot } from '../constants/privacyPolicyDefaults'

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
  const consentsRef = userRef.collection('privacyConsents')
  const batch = db.batch()
  // 規則要求 users 上的 privacyConsent* 須與 privacyConsents/_latest 同步（見 firestore.rules）
  batch.set(consentsRef.doc('_latest'), consentRecord, { merge: true })
  batch.set(consentsRef.doc(consentId), consentRecord)
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
