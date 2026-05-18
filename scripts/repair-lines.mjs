import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/components/LegacyApp.jsx')
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)

const fixes = {
  178: "      const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', email: '', lineId: '', gender: '女' });",
  205: "      const [storeSlogan, setStoreSlogan] = useState('嚴選優質堅果、牛軋糖、核桃糕...手作，純粹養生');",
  212: "      const [activeCategory, setActiveCategory] = useState('全部');",
  224: "      const defaultAboutData = { title: '關於木子家 MUZI MAISON', content: '精選優質堅果，提供最便利的線上訂購體驗。\\n\\n歡迎選購！', image: '' };",
  246: "      const [categoriesList, setCategoriesList] = useState([{ name: '精選商品', isHidden: false }, { name: '糖果軟糕系列(300g)', isHidden: false }]);"
}

for (const [ln, text] of Object.entries(fixes)) {
  const i = Number(ln) - 1
  if (lines[i]) {
    lines[i] = text
    console.log('fixed line', ln)
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8')
