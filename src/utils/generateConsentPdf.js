import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

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

export function buildConsentPdfHtml(consent, customerName) {
  const snap = consent.policySnapshot || {}
  const cust = consent.customerSnapshot || {}
  const agreedAt = formatTs(consent.agreedAt || consent.clientAgreedAt)

  return `
    <div style="width: 794px; padding: 40px; box-sizing: border-box; background: #fff; font-family: 'Microsoft JhengHei', 'PingFang TC', sans-serif; color: #1c1917; font-size: 14px; line-height: 1.65;">
      <h1 style="text-align: center; font-size: 22px; margin: 0 0 8px; border-bottom: 2px solid #292524; padding-bottom: 12px;">木子家 MUZI MAISON</h1>
      <p style="text-align: center; font-size: 13px; color: #57534e; margin: 0 0 24px;">個人資料同意紀錄證明</p>

      <section style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; margin: 0 0 12px; color: #92400e;">一、客戶與同意狀態</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr><td style="padding: 4px 8px; color: #78716c; width: 28%;">姓名</td><td style="padding: 4px 8px; font-weight: bold;">${escapeHtml(cust.name || customerName || '—')}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">性別</td><td style="padding: 4px 8px;">${escapeHtml(cust.gender || '—')}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">Email</td><td style="padding: 4px 8px; font-family: monospace; font-size: 12px;">${escapeHtml(cust.email || '—')}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">電話</td><td style="padding: 4px 8px;">${escapeHtml(cust.phone || '—')}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">LINE ID</td><td style="padding: 4px 8px;">${escapeHtml(cust.lineId || '—')}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">地址</td><td style="padding: 4px 8px;">${escapeHtml(cust.address || '—')}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">同意時間</td><td style="padding: 4px 8px; font-weight: bold;">${escapeHtml(agreedAt)}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">政策版本</td><td style="padding: 4px 8px;">v${escapeHtml(snap.version || consent.policyVersion || '—')}（${escapeHtml(snap.effectiveDate || '—')}）</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">已了解政策</td><td style="padding: 4px 8px;">${consent.understood ? '✓ 是' : '✗ 否'}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">已同意蒐集利用</td><td style="padding: 4px 8px;">${consent.agreed ? '✓ 是' : '✗ 否'}</td></tr>
          <tr><td style="padding: 4px 8px; color: #78716c;">行銷推播（LINE）</td><td style="padding: 4px 8px;">${consent.marketingAgreed !== false ? '✓ 已同意' : '未同意'}</td></tr>
        </table>
        ${consent.userAgent ? `<p style="font-size: 10px; color: #a8a29e; margin: 12px 0 0; word-break: break-all;">裝置紀錄：${escapeHtml(consent.userAgent)}</p>` : ''}
      </section>

      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 15px; margin: 0 0 10px; color: #92400e; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px;">二、《個人資料保護暨隱私權政策》（同意當下版本）</h2>
        <div style="font-size: 12px; text-align: justify;">${nl2br(snap.privacyPolicyBody || '')}</div>
      </section>

      <section style="margin-bottom: 24px;">
        <h2 style="font-size: 15px; margin: 0 0 10px; color: #92400e; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px;">三、《個人資料蒐集、處理及利用同意書》（同意當下版本）</h2>
        <div style="font-size: 12px; text-align: justify;">${nl2br(snap.consentFormBody || '')}</div>
      </section>

      <p style="font-size: 11px; color: #78716c; text-align: center; border-top: 1px dashed #d6d3d1; padding-top: 12px;">
        本文件由系統依客戶同意當下之紀錄自動產生 · ${escapeHtml(snap.businessName || '木子家 MUZI MAISON')} · 負責人 ${escapeHtml(snap.responsiblePerson || '李培智')}
      </p>
    </div>
  `
}

async function renderHtmlToPdf(html, filename) {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.innerHTML = html
  document.body.appendChild(container)

  const root = container.firstElementChild
  if (!root) {
    document.body.removeChild(container)
    throw new Error('PDF 內容產生失敗')
  }

  try {
    const canvas = await html2canvas(root, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0
    const imgData = canvas.toDataURL('image/png')

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
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
  await renderHtmlToPdf(buildConsentPdfHtml(consent, customerName), filename)
}
