import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/components/LegacyApp.jsx')
let t = fs.readFileSync(file, 'utf8')

const pairs = [
  ["gender: '\uFFFD? });", "gender: '女' });"],
  ["gender: '? });", "gender: '女' });"],
  ["useState('?部');", "useState('全部');"],
  ["useState('??快??帳", "useState('非會員快速結帳（建立會員帳號）'"],
  ["{ name: '精選?品?'", "{ name: '精選商品'"],
  ["|| '精選?品?'", "|| '精選商品'"],
  ["{ name: '糖?軟?系?(300g)'", "{ name: '糖果軟糕系列(300g)'"],
  [
    "title: '?於??MUZI MAISON', content: '?選?質??，?供?便利??上?購?驗。\\n\\n歡??購?, image: ''",
    "title: '關於木子家 MUZI MAISON', content: '精選優質堅果，提供最便利的線上訂購體驗。\\n\\n歡迎選購！', image: ''"
  ],
  [
    "useState('??堅果、牛軋糖、核桃糕...手作?選??');",
    "useState('嚴選優質堅果、牛軋糖、核桃糕...手作，純粹養生');"
  ],
  ["useState('??堅果", "useState('嚴選優質堅果、牛軋糖、核桃糕...手作，純粹養生'"],
  ["content={storeSlogan || '線?訂購?便利'}", "content={storeSlogan || '線上訂購更便利'}"],
  ["placeholder=\"輸入??標?...\"", "placeholder=\"輸入標語...\""],
  ["系統載入?..", "系統載入中..."],
  ['/** ??浮動 LINE', '/** 全站浮動 LINE'],
  ['（網?與側邊欄「聯絡我們」相同）', '（網址與側邊欄「聯絡我們」相同）'],
  ['/** ????覽 og:image', '/** 分享預覽 og:image'],
  ['?為絕?網?', '改為絕對網址'],
  ['// ?? ?載入', '// 首次 載入'],
  ['?面?現', '頁面閃現'],
  ['首?輪播', '首頁輪播'],
  ['?）存於', '秒）存於']
]

let n = 0
for (const [from, to] of pairs) {
  if (t.includes(from)) {
    t = t.split(from).join(to)
    n++
  }
}

fs.writeFileSync(file, t, 'utf8')
console.log('applied', n, 'replacement groups')
