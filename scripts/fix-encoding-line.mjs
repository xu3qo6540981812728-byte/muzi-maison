import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/components/LegacyApp.jsx')
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
let n = 0
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('const GUEST_CHECKOUT_LABEL')) {
    lines[i] = "const GUEST_CHECKOUT_LABEL = '非會員快速結帳（建立會員帳號）'"
    n++
  }
  if (lines[i].includes('LineFloatButton') && lines[i - 1]?.includes('浮動 LINE')) {
    lines[i - 1] = '/** 全站浮動 LINE（網址與側邊欄「聯絡我們」相同） */'
    n++
  }
  if (lines[i].includes('paymentMethods') && lines[i].includes('付款')) {
    lines[i] = lines[i].replace(/付款[^<]*/, '付款方式')
    n++
  }
}
fs.writeFileSync(file, lines.join('\n'), 'utf8')
console.log('patched lines:', n)
