import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const PAGE_W = 794
const PAGE_H = 1123
const PAD = 40
const BODY_LINES_PER_PAGE = 32

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatTs(ts) {
  if (!ts) return '—'
  if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString('zh-TW')
  if (ts instanceof Date) return ts.toLocaleString('zh-TW')
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString('zh-TW')
}

function nl2br(text) {
  return escapeHtml(text).replace(/\n/g, '<br/>')
}

function chunkTextByLines(text, linesPerPage) {
  const lines = String(text || '').split('\n')
  if (!lines.length) return ['']
  const chunks = []
  for (let i = 0; i < lines.length; i += linesPerPage) {
    chunks.push(lines.slice(i, i + linesPerPage).join('\n'))
  }
  return chunks
}

function pageFrame(bodyHtml, pageNum, totalPages) {
  return `
    <div style="width:${PAGE_W}px;height:${PAGE_H}px;padding:${PAD}px;box-sizing:border-box;background:#fff;font-family:'Microsoft JhengHei','PingFang TC',sans-serif;color:#1c1917;font-size:14px;line-height:1.65;position:relative;overflow:hidden;">
      ${bodyHtml}
      <p style="position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:10px;color:#a8a29e;margin:0;">第 ${pageNum} / ${totalPages} 頁</p>
    </div>
  `
}

export function buildConsentPdfPages(consent, customerName) {
  const snap = consent.policySnapshot || {}
  const cust = consent.customerSnapshot || {}
  const agreedAt = formatTs(consent.agreedAt || consent.clientAgreedAt)

  const summaryHtml = `
    <h1 style="text-align:center;font-size:22px;margin:0 0 8px;border-bottom:2px solid #292524;padding-bottom:12px;">木子家 MUZI MAISON</h1>
    <p style="text-align:center;font-size:13px;color:#57534e;margin:0 0 20px;">個人資料同意紀錄證明</p>
    <section style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h2 style="font-size:15px;margin:0 0 12px;color:#6B5A45;">一、客戶與同意狀態</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:4px 8px;color:#78716c;width:28%;">姓名</td><td style="padding:4px 8px;font-weight:bold;">${escapeHtml(cust.name || customerName || '—')}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">性別</td><td style="padding:4px 8px;">${escapeHtml(cust.gender || '—')}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">Email</td><td style="padding:4px 8px;font-family:monospace;font-size:12px;">${escapeHtml(cust.email || '—')}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">電話</td><td style="padding:4px 8px;">${escapeHtml(cust.phone || '—')}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">LINE ID</td><td style="padding:4px 8px;">${escapeHtml(cust.lineId || '—')}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">地址</td><td style="padding:4px 8px;">${escapeHtml(cust.address || '—')}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">同意時間</td><td style="padding:4px 8px;font-weight:bold;">${escapeHtml(agreedAt)}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">政策版本</td><td style="padding:4px 8px;">v${escapeHtml(snap.version || consent.policyVersion || '—')}（${escapeHtml(snap.effectiveDate || '—')}）</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">已了解政策</td><td style="padding:4px 8px;">${consent.understood ? '✓ 是' : '✗ 否'}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">已同意蒐集利用</td><td style="padding:4px 8px;">${consent.agreed ? '✓ 是' : '✗ 否'}</td></tr>
        <tr><td style="padding:4px 8px;color:#78716c;">行銷推播（LINE）</td><td style="padding:4px 8px;">${consent.marketingAgreed !== false ? '✓ 已同意' : '未同意'}</td></tr>
      </table>
      ${consent.userAgent ? `<p style="font-size:10px;color:#a8a29e;margin:12px 0 0;word-break:break-all;">裝置紀錄：${escapeHtml(consent.userAgent)}</p>` : ''}
    </section>
  `

  const policyChunks = chunkTextByLines(snap.privacyPolicyBody, BODY_LINES_PER_PAGE)
  const consentChunks = chunkTextByLines(snap.consentFormBody, BODY_LINES_PER_PAGE)

  const bodies = [summaryHtml]

  policyChunks.forEach((chunk, idx) => {
    bodies.push(`
      <h2 style="font-size:15px;margin:0 0 10px;color:#6B5A45;border-bottom:1px solid #e7e5e4;padding-bottom:6px;">二、《個人資料保護暨隱私權政策》${idx > 0 ? '（續）' : '（同意當下版本）'}</h2>
      <div style="font-size:12px;text-align:justify;">${nl2br(chunk)}</div>
    `)
  })

  consentChunks.forEach((chunk, idx) => {
    bodies.push(`
      <h2 style="font-size:15px;margin:0 0 10px;color:#6B5A45;border-bottom:1px solid #e7e5e4;padding-bottom:6px;">三、《個人資料蒐集、處理及利用同意書》${idx > 0 ? '（續）' : '（同意當下版本）'}</h2>
      <div style="font-size:12px;text-align:justify;">${nl2br(chunk)}</div>
    `)
  })

  bodies.push(`
    <p style="font-size:11px;color:#78716c;text-align:center;border-top:1px dashed #d6d3d1;padding-top:12px;margin-top:16px;">
      本文件由系統依客戶同意當下之紀錄自動產生 · ${escapeHtml(snap.businessName || '木子家 MUZI MAISON')} · 負責人 ${escapeHtml(snap.responsiblePerson || '李培智')}
    </p>
  `)

  const total = bodies.length
  return bodies.map((body, i) => pageFrame(body, i + 1, total))
}

async function renderPagesToPdf(pageHtmlList, filename) {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  try {
    for (let i = 0; i < pageHtmlList.length; i++) {
      container.innerHTML = pageHtmlList[i]
      const pageEl = container.firstElementChild
      if (!pageEl) throw new Error('PDF 分頁產生失敗')

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: PAGE_W,
        height: PAGE_H
      })

      const imgData = canvas.toDataURL('image/png')
      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    }
    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}

export async function downloadConsentPdf(consent, customerName) {
  const safeName = String(customerName || consent?.customerSnapshot?.name || '客戶').replace(
    /[/\\?%*:|"<>]/g,
    '_'
  )
  const agreedAt = consent?.agreedAt || consent?.clientAgreedAt
  let dateStr = '紀錄'
  if (agreedAt) {
    const d = typeof agreedAt.toDate === 'function' ? agreedAt.toDate() : new Date(agreedAt)
    if (!Number.isNaN(d.getTime())) {
      dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    }
  }
  const filename = `木子家_個資同意書_${safeName}_${dateStr}.pdf`
  const pages = buildConsentPdfPages(consent, customerName)
  await renderPagesToPdf(pages, filename)
}
