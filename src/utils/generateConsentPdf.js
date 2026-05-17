import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const PAGE_W = 794
const PAD = 40
const INNER_W = PAGE_W - PAD * 2
const MAX_CONTENT_H = 960

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

function measureHtmlHeight(innerHtml) {
  const wrap = document.createElement('div')
  wrap.style.cssText = `position:absolute;left:-9999px;top:0;width:${INNER_W}px;visibility:hidden;`
  wrap.innerHTML = innerHtml
  document.body.appendChild(wrap)
  const h = wrap.scrollHeight
  document.body.removeChild(wrap)
  return h
}

function sectionHeading(title, continued) {
  if (continued) {
    return `<h2 style="font-size:14px;margin:12px 0 8px;color:#6B5A45;">${title}（續）</h2>`
  }
  return `<h2 style="font-size:15px;margin:0 0 10px;color:#6B5A45;border-bottom:1px solid #e7e5e4;padding-bottom:6px;">${title}</h2>`
}

function sectionBodyHtml(bodyLines) {
  return `<div style="font-size:12px;text-align:justify;line-height:1.6;">${nl2br(bodyLines.join('\n'))}</div>`
}

/** @param {'main'|'continued'|'body-only'} mode */
function sectionChunkHtml(title, bodyLines, mode) {
  const body = sectionBodyHtml(bodyLines)
  if (mode === 'body-only') return body
  if (mode === 'continued') return `${sectionHeading(title, true)}${body}`
  return `${sectionHeading(title, false)}${body}`
}

function tryAppendBlock(pages, currentRef, html) {
  const trial = currentRef.value + html
  if (currentRef.value && measureHtmlHeight(trial) > MAX_CONTENT_H) {
    pages.push(currentRef.value)
    currentRef.value = html
  } else {
    currentRef.value = trial
  }
}

/** 僅在實際換頁時才顯示「（續）」 */
function appendSectionToPages(pages, currentRef, title, body) {
  let remaining = String(body || '').split('\n')
  if (!remaining.length) remaining = ['']

  let isFirstChunk = true

  while (remaining.length > 0) {
    const headingMode = isFirstChunk
      ? 'main'
      : currentRef.value === ''
        ? 'continued'
        : 'body-only'

    let fitCount = 0
    for (let i = 1; i <= remaining.length; i++) {
      const html = sectionChunkHtml(title, remaining.slice(0, i), headingMode)
      const trial = currentRef.value + html
      if (measureHtmlHeight(trial) <= MAX_CONTENT_H) fitCount = i
      else break
    }

    if (fitCount === 0) {
      if (currentRef.value) {
        pages.push(currentRef.value)
        currentRef.value = ''
        continue
      }
      fitCount = 1
    }

    const html = sectionChunkHtml(title, remaining.slice(0, fitCount), headingMode)
    tryAppendBlock(pages, currentRef, html)
    remaining = remaining.slice(fitCount)
    isFirstChunk = false
  }
}

function buildFooterHtml(snap) {
  return `<p style="font-size:11px;color:#78716c;text-align:center;border-top:1px dashed #d6d3d1;padding-top:12px;margin-top:24px;line-height:1.5;">本文件由系統依客戶同意當下之紀錄自動產生 · ${escapeHtml(snap.businessName || '木子家 MUZI MAISON（個人工作室）')} · 負責人 ${escapeHtml(snap.responsiblePerson || '李培智')}</p>`
}

export async function buildConsentPdfPages(consent, customerName) {
  const snap = consent.policySnapshot || {}
  const cust = consent.customerSnapshot || {}
  const agreedAt = formatTs(consent.agreedAt || consent.clientAgreedAt)

  const summaryHtml = `
    <h1 style="text-align:center;font-size:22px;margin:0 0 8px;border-bottom:2px solid #292524;padding-bottom:12px;">木子家 MUZI MAISON</h1>
    <p style="text-align:center;font-size:13px;color:#57534e;margin:0 0 16px;">個人資料同意紀錄證明</p>
    <section style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:14px;margin-bottom:12px;">
      <h2 style="font-size:15px;margin:0 0 10px;color:#6B5A45;">一、客戶與同意狀態</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:3px 8px;color:#78716c;width:28%;">姓名</td><td style="padding:3px 8px;font-weight:bold;">${escapeHtml(cust.name || customerName || '—')}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">性別</td><td style="padding:3px 8px;">${escapeHtml(cust.gender || '—')}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">Email</td><td style="padding:3px 8px;font-family:monospace;font-size:12px;">${escapeHtml(cust.email || '—')}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">電話</td><td style="padding:3px 8px;">${escapeHtml(cust.phone || '—')}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">LINE ID</td><td style="padding:3px 8px;">${escapeHtml(cust.lineId || '—')}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">地址</td><td style="padding:3px 8px;">${escapeHtml(cust.address || '—')}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">同意時間</td><td style="padding:3px 8px;font-weight:bold;">${escapeHtml(agreedAt)}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">政策版本</td><td style="padding:3px 8px;">v${escapeHtml(snap.version || consent.policyVersion || '—')}（${escapeHtml(snap.effectiveDate || '—')}）</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">已了解政策</td><td style="padding:3px 8px;">${consent.understood ? '✓ 是' : '✗ 否'}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">已同意蒐集利用</td><td style="padding:3px 8px;">${consent.agreed ? '✓ 是' : '✗ 否'}</td></tr>
        <tr><td style="padding:3px 8px;color:#78716c;">行銷推播（LINE）</td><td style="padding:3px 8px;">${consent.marketingAgreed !== false ? '✓ 已同意' : '未同意'}</td></tr>
      </table>
      ${consent.userAgent ? `<p style="font-size:10px;color:#a8a29e;margin:10px 0 0;word-break:break-all;">裝置紀錄：${escapeHtml(consent.userAgent)}</p>` : ''}
    </section>
  `

  const footer = buildFooterHtml(snap)
  const pages = []
  const currentRef = { value: '' }

  tryAppendBlock(pages, currentRef, summaryHtml)
  appendSectionToPages(pages, currentRef, '二、《個人資料保護暨隱私權政策》（同意當下版本）', snap.privacyPolicyBody)
  appendSectionToPages(pages, currentRef, '三、《個人資料蒐集、處理及利用同意書》（同意當下版本）', snap.consentFormBody)

  if (currentRef.value) pages.push(currentRef.value)
  if (pages.length > 0) pages[pages.length - 1] += footer

  const total = pages.length
  return pages.map(
    (body, i) => `
    <div style="width:${PAGE_W}px;padding:${PAD}px ${PAD}px 32px;box-sizing:border-box;background:#fff;font-family:'Microsoft JhengHei','PingFang TC',sans-serif;color:#1c1917;font-size:14px;line-height:1.65;">
      ${body}
      <p style="text-align:center;font-size:10px;color:#a8a29e;margin:16px 0 0;">第 ${i + 1} / ${total} 頁</p>
    </div>
  `
  )
}

async function renderPagesToPdf(pageHtmlList, filename) {
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:0;top:0;width:${PAGE_W}px;z-index:-1;opacity:0;pointer-events:none;overflow:visible;`
  document.body.appendChild(container)

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  try {
    for (let i = 0; i < pageHtmlList.length; i++) {
      container.innerHTML = pageHtmlList[i]
      const pageEl = container.firstElementChild
      if (!pageEl) throw new Error('PDF 分頁產生失敗')

      pageEl.style.width = `${PAGE_W}px`
      pageEl.style.maxWidth = `${PAGE_W}px`
      pageEl.style.boxSizing = 'border-box'

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const imgH = (canvas.height * pageW) / canvas.width

      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, Math.min(imgH, pageH))
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
  const pages = await buildConsentPdfPages(consent, customerName)
  await renderPagesToPdf(pages, filename)
}
