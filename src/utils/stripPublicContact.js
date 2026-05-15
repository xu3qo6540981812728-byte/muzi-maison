/** 從 settings/contact 讀取時剔除 bankAccount（舊資料殘留） */
export function stripBankAccountFromContact(docData) {
  if (!docData || typeof docData !== 'object') return {}
  const { bankAccount: _omit, ...publicFields } = docData
  return publicFields
}
