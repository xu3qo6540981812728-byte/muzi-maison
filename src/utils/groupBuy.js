/** sessionStorage keys（揪團） */
export const GROUP_STORAGE_HOST_SID = 'muzi_group_host_sid'
export const GROUP_STORAGE_FRIEND_SID = 'muzi_group_friend_sid'
export const GROUP_STORAGE_FRIEND_NAME = 'muzi_group_friend_name'
export const GROUP_STORAGE_FRIEND_PHONE = 'muzi_group_friend_phone'

/** 揪團 line 上用以區分參與者（姓名 + 電話）；舊資料只有姓名時仍可顯示 */
export function participantLineLabel(participantName, participantPhone) {
  const n = String(participantName || '').trim()
  const digits = String(participantPhone || '').replace(/\D/g, '')
  if (!n && !digits) return ''
  if (!digits) return n
  return `${n}｜${digits}`
}

/** 揪團：將每人數量合併成「小美x2、小華x1」字串 */
export function formatGroupSplits(splitsObj) {
  return Object.entries(splitsObj || {})
    .filter(([, q]) => q > 0)
    .sort(([a], [b]) => a.localeCompare(b, 'zh-Hant'))
    .map(([name, q]) => `${name}x${q}`)
    .join('、')
}

/** 分裝標籤印給客人／出貨單時：只留姓名，隱藏「｜09xxxxxxxx」 */
export function splitLabelForPublicDisplay(label) {
  const s = String(label || '').trim()
  const idx = s.indexOf('｜')
  if (idx <= 0) return s
  const tailDigits = s.slice(idx + 1).replace(/\D/g, '')
  if (/^09\d{8}$/.test(tailDigits)) {
    return s.slice(0, idx).trim() || s
  }
  return s
}

/** 同 formatGroupSplits，但 key 會先經 splitLabelForPublicDisplay（同名會合併數量） */
export function formatGroupSplitsDisplay(splitsObj) {
  const merged = {}
  Object.entries(splitsObj || {}).forEach(([k, q]) => {
    const qn = Number(q) || 0
    if (qn <= 0) return
    const dk = splitLabelForPublicDisplay(k)
    if (!dk) return
    merged[dk] = (merged[dk] || 0) + qn
  })
  return formatGroupSplits(merged)
}

/** 將 lines 子集合資料聚合成購物車與註記 */
export function aggregateGroupLines(linesArray) {
  const byProduct = {}
  ;(linesArray || []).forEach((line) => {
    const { productId, participantName, participantPhone, qty } = line
    if (!productId) return
    const label =
      participantLineLabel(participantName, participantPhone) || String(participantName || '').trim()
    if (!label) return
    const q = Number(qty) || 0
    if (q <= 0) return
    if (!byProduct[productId]) byProduct[productId] = {}
    byProduct[productId][label] = (byProduct[productId][label] || 0) + q
  })
  const cart = {}
  const labels = {}
  const labelsDisplay = {}
  Object.entries(byProduct).forEach(([pid, splits]) => {
    const total = Object.values(splits).reduce((a, b) => a + b, 0)
    if (total <= 0) return
    cart[pid] = total
    labels[pid] = formatGroupSplits(splits)
    labelsDisplay[pid] = formatGroupSplitsDisplay(splits)
  })
  return { cart, labels, labelsDisplay }
}

/** Firestore lines 文件 ID（依品號 + 參與者識別字串，通常為 participantLineLabel） */
export function groupLineDocId(productId, participantName) {
  const safePid = String(productId).replace(/\//g, '_').slice(0, 120)
  let slug = ''
  try {
    slug = btoa(unescape(encodeURIComponent(participantName)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .slice(0, 120)
  } catch {
    slug = String(participantName)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 80)
  }
  return `${safePid}__${slug}`.slice(0, 700)
}
