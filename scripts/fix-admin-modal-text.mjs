import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/components/admin/AdminCustomersModal.jsx')
let s = fs.readFileSync(target, 'utf8')

const replacements = [
  ['<UsersIcon size={24} className="text-blue-600" /> ????', '<UsersIcon size={24} className="text-blue-600" /> 客戶管理'],
  ['placeholder="???????? Email"', 'placeholder="搜尋姓名、電話或 Email"'],
  ["showDeletedCustomers ? '??????' : '??????'", "showDeletedCustomers ? '返回正常客戶' : '查看停用客戶'"],
  ['<Plus size={16} /> ????', '<Plus size={16} /> 新增客戶'],
  ['mt-10">???????</p>', 'mt-10">查無符合的客戶</p>'],
  ['rounded-md mt-1">???</motion>', 'rounded-md mt-1">已停用</div>'],
  ['rounded-md mt-1">???</div>', 'rounded-md mt-1">已停用</motion>'],
  ['`Email?${user.email}`', '`Email：${user.email}`'],
  ["'? Email ??'", "'無 Email 紀錄'"],
  ['>????????</span>', '>點擊查看詳細資料</span>'],
  ['>??????...</button>', '>載入更多客戶...</button>'],
  ['rotate-180" /> ??', 'rotate-180" /> 返回'],
  ['<EditIcon size={14} /> ??', '<EditIcon size={14} /> 編輯'],
  ['className="text-xs font-bold text-stone-400 hover:text-stone-600">\n                          ??', 'className="text-xs font-bold text-stone-400 hover:text-stone-600">\n                          取消'],
  ['<ShoppingCart size={18} /> ??????', '<ShoppingCart size={18} /> 幫客戶代建單'],
  ['<DownloadIcon size={18} /> ??????? PDF', '<DownloadIcon size={18} /> 下載個資同意書 PDF'],
  ['mb-0.5">?? Email???????????</span>', 'mb-0.5">註冊 Email（登入帳號，僅供檢視）</span>'],
  ["'????????????'", "'（無紀錄，可能為舊資料）'"],
  ['placeholder="??"', 'placeholder="姓名"'],
  ['type="tel" placeholder="????"', 'type="tel" placeholder="聯絡電話"'],
  ['textarea placeholder="????"', 'textarea placeholder="聯絡地址"'],
  ['title="????"', 'title="刪除客戶"'],
  ['>????</button>', '>儲存修改</button>'],
  ['block mb-1">?? Email</span>', 'block mb-1">註冊 Email</span>'],
  ["|| '???'", "|| '未提供'"],
  ['block mb-1">??</span>', 'block mb-1">性別</span>'],
  ['block mb-1">????</span><span className="font-bold">{selectedCustomer.phone}', 'block mb-1">聯絡電話</span><span className="font-bold">{selectedCustomer.phone}'],
  ['block mb-1">????</span><span className="font-bold">{selectedCustomer.address', 'block mb-1">預設地址</span><span className="font-bold">{selectedCustomer.address'],
  ['block mb-1">??????</span>', 'block mb-1">個資同意紀錄</span>'],
  ['font-bold">????????????</p>', 'font-bold">無電子同意（管理員代建）</p>'],
  ['text-teal-700">???</span>', 'text-teal-700">已同意</span>'],
  ['? ` ? ?? v', ' ? ` · 版本 v'],
  ['text-stone-400">????????????????</p>', 'text-stone-400">尚無紀錄（可能為政策實施前註冊）</p>'],
  ['py-2 rounded-lg">?? ??????????</p>', 'py-2 rounded-lg">⚠️ 此帳號目前為停用狀態</p>'],
  ['gap-1">\n                            ??????\n                          </button>', 'gap-1">\n                            恢復帳號權限\n                          </button>'],
  ['font-bold text-stone-800">????</h3>', 'font-bold text-stone-800">歷史訂單</h3>'],
  ['<LinkIcon size={14} /> ???? (', '<LinkIcon size={14} /> 確認合併 ('],
  ["isMergeMode ? '??????' : '???????'", "isMergeMode ? '取消合併模式' : '合併待處理訂單'"],
  ['border-dashed">??????</p>', 'border-dashed">尚無訂單紀錄</p>'],
  ['ml-1">??</span>', 'ml-1">代建</span>'],
]

for (const [from, to] of replacements) {
  if (s.includes(from)) s = s.split(from).join(to)
}

// gender radios
s = s.replace(
  /<label className="flex items-center gap-1"><input type="radio" name="adminGender" value="\?" checked=\{selectedCustomer\.gender === '\?'\} onChange=\{\(e\) => setSelectedCustomer\(\{ \.\.\.selectedCustomer, gender: e\.target\.value \}\)\} \/>\?<\/label>\s*<label className="flex items-center gap-1"><input type="radio" name="adminGender" value="\?" checked=\{selectedCustomer\.gender === '\?'\} onChange=\{\(e\) => setSelectedCustomer\(\{ \.\.\.selectedCustomer, gender: e\.target\.value \}\)\} \/>\?<\/label>/,
  `<label className="flex items-center gap-1"><input type="radio" name="adminGender" value="男" checked={selectedCustomer.gender === '男'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />男</label>
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="女" checked={selectedCustomer.gender === '女'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />女</label>`
)

s = s.replace(/<motion(\s[^>]*)>/g, '<motion$1>')
s = s.replace(/<\/motion>/g, '</motion>')
s = s.replace(/<motion(\s[^>]*)>/g, '<div$1>')
s = s.replace(/<\/motion>/g, '</div>')

fs.writeFileSync(target, s, 'utf8')
const remaining = (s.match(/\?{2,}/g) || []).length
console.log('fixed AdminCustomersModal, remaining ? groups:', remaining)
