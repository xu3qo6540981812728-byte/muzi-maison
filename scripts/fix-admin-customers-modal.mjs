import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const target = path.join(__dirname, '../src/components/admin/AdminCustomersModal.jsx')

let s = fs.readFileSync(target, 'utf8')

function R(from, to) {
  if (s.includes(from)) s = s.split(from).join(to)
  else console.warn('miss:', JSON.stringify(from.slice(0, 50)))
}

const z = {
  title: '\u5ba2\u6236\u7ba1\u7406\u4e2d\u5fc3',
  search: '\u641c\u5c0b\u59d3\u540d\u3001\u96fb\u8a71\u6216 Email\u2026',
  backList: '\u8fd4\u56de\u6b63\u5e38\u540d\u55ae',
  delList: '\u67e5\u770b\u505c\u7528\u540d\u55ae',
  add: '\u65b0\u589e\u5ba2\u6236',
  empty: '\u627e\u4e0d\u5230\u5ba2\u6236\u8cc7\u6599',
  prev: '\u4e0a\u4e00\u9801',
  next: '\u4e0b\u4e00\u9801',
  pageLine: '\u7b2c {currentPage} \u9801 / {totalPages}',
  countLine: '\u5171 {filteredUsersCount} \u4f4d\u5ba2\u6236',
  loadMore: '\u5f9e\u8cc7\u6599\u5eab\u8f09\u5165\u66f4\u591a\u5ba2\u6236\u2026',
  back: '\u8fd4\u56de',
  edit: '\u7de8\u8f2f',
  cancel: '\u53d6\u6d88',
  proxy: '\u4ee3\u5ba2\u4e0b\u55ae',
  pdf: '\u4e0b\u8f09\u500b\u8cc7\u540c\u610f PDF',
  emailHint: '\u6703\u54e1 Email\uff08\u50c5\u4f9b\u986f\u793a\uff0c\u7121\u6cd5\u4fee\u6539\uff09',
  noEmail: '\uff08\u5c1a\u672a\u7d81\u5b9a Email\uff09',
  name: '\u59d3\u540d',
  male: '\u7537',
  female: '\u5973',
  phone: '\u624b\u6a5f\u865f\u78bc',
  addr: '\u806f\u7d61\u5730\u5740',
  disable: '\u505c\u7528\u5e33\u865f',
  save: '\u5132\u5b58\u8b8a\u66f4',
  email: '\u6703\u54e1 Email',
  none: '\uff08\u7121\uff09',
  gender: '\u6027\u5225',
  consent: '\u500b\u8cc7\u540c\u610f\u7d00\u9304',
  noE: '\u672a\u63d0\u4f9b\u96fb\u5b50\u500b\u8cc7\u540c\u610f',
  ok: '\u5df2\u540c\u610f',
  ver: '\u00b7 \u7248\u672c v',
  noRec: '\u5c1a\u7121\u540c\u610f\u7d00\u9304\uff08\u53ef\u80fd\u70ba\u820a\u5ba2\u6236\u6216\u7dda\u4e0b\u540c\u610f\uff09',
  stopped: '\u6b64\u5ba2\u6236\u5df2\u505c\u7528',
  restore: '\u9084\u539f\u5ba2\u6236\u8cc7\u6599',
  hist: '\u6b77\u53f2\u8a02\u55ae',
  merge: '\u78ba\u8a8d\u5408\u4f75',
  cancelM: '\u53d6\u6d88\u5408\u4f75',
  startM: '\u5408\u4f75\u5f85\u78ba\u8a8d\u8a02\u55ae',
  noOrd: '\u5c1a\u672a\u6709\u8a02\u55ae\u7d00\u9304',
  admin: '\u4ee3\u4e0b'
}

// motion -> div (opening tags with attributes)
s = s.replace(/<motion\.div\b/g, '<div')
s = s.replace(/<\/motion\.motion>/g, '</div>')

const reps = [
  ['text-blue-600" /> ??????', `text-blue-600" /> ${z.title}`],
  ['placeholder="???????? Email?"', `placeholder="${z.search}"`],
  [`showDeletedCustomers ? '??????' : '??????'`, `showDeletedCustomers ? '${z.backList}' : '${z.delList}'`],
  ['<Plus size={16} /> ????', `<Plus size={16} /> ${z.add}`],
  ['mt-10">???????', `mt-10">${z.empty}`],
  ['\n                    ???\n                  </button>\n                  <span className="text-sm font-bold text-stone-600', `\n                    ${z.prev}\n                  </button>\n                  <span className="text-sm font-bold text-stone-600`],
  ['? {currentPage} ? / {totalPages}', z.pageLine],
  ['? {filteredUsersCount} ???', z.countLine],
  ['\n                    ???\n                  </button>\n                </div>\n                {filteredUsersCount', `\n                    ${z.next}\n                  </button>\n                </div>\n                {filteredUsersCount`],
  ['\n                      ???????????\n                    </button>', `\n                      ${z.loadMore}\n                    </button>`],
  ['rotate-180" /> ??', `rotate-180" /> ${z.back}`],
  ['<EditIcon size={14} /> ??', `<EditIcon size={14} /> ${z.edit}`],
  ['\n                          ??\n                        </button>', `\n                          ${z.cancel}\n                        </button>`],
  ['<ShoppingCart size={18} /> ????', `<ShoppingCart size={18} /> ${z.proxy}`],
  ['<DownloadIcon size={18} /> ?????? PDF', `<DownloadIcon size={18} /> ${z.pdf}`],
  ['<DownloadIcon size={18} /> ??????? PDF', `<DownloadIcon size={18} /> ${z.pdf}`],
  ['?? Email???????????', z.emailHint],
  ["email || '????????????'", `email || '${z.noEmail}'`],
  ["email || '????? Email?'", `email || '${z.noEmail}'`],
  ['placeholder="??"', `placeholder="${z.name}"`],
  ['block mb-1">????</span><span className="font-bold">{selectedCustomer.address', `block mb-1">${z.addr}</span><span className="font-bold">{selectedCustomer.address`],
  ['font-bold">?????????</p>', `font-bold">${z.noE}</p>`],
  ['font-bold">????????????</p>', `font-bold">${z.noE}</p>`],
  ['? ` ? ?? v${', `? \`${z.ver}\${`],
  ['? ` \ufffd ?? v${', `? \`${z.ver}\${`],
  ['text-stone-400">???????????????????</p>', `text-stone-400">${z.noRec}</p>`],
  ['text-stone-400">????????????????</p>', `text-stone-400">${z.noRec}</p>`],
  ['py-2 rounded-lg">??????</p>', `py-2 rounded-lg">${z.stopped}</p>`],
  ['py-2 rounded-lg">?? ??????????</p>', `py-2 rounded-lg">${z.stopped}</p>`],
  ['\n                            ??????\n                          </button>', `\n                            ${z.restore}\n                          </button>`],
  ['text-stone-800">????</h3>', `text-stone-800">${z.hist}</h3>`],
  ['<LinkIcon size={14} /> ???? ({mergeSelection.length})', `<LinkIcon size={14} /> ${z.merge} ({mergeSelection.length})`],
  ["isMergeMode ? '????' : '???????'", `isMergeMode ? '${z.cancelM}' : '${z.startM}'`],
  ['border-dashed">???????</p>', `border-dashed">${z.noOrd}</p>`],
  ['ml-1">??</span>', `ml-1">${z.admin}</span>`],
  ['title="????"', `title="${z.disable}"`],
  ['transition-colors">????</button>', `transition-colors">${z.save}</button>`],
  ['block mb-1">?? Email</span>', `block mb-1">${z.email}</span>`],
  ["email || '???'", `email || '${z.none}'`],
  ['block mb-1">??</span><span className="font-bold">{selectedCustomer.gender', `block mb-1">${z.gender}</span><span className="font-bold">{selectedCustomer.gender`],
  ["lineId || '???'", `lineId || '${z.none}'`],
  ["address || '???'", `address || '${z.none}'`],
  ['block mb-1">??????</span>', `block mb-1">${z.consent}</span>`],
  ['text-teal-700">???</span>', `text-teal-700">${z.ok}</span>`],
  ['placeholder="????" value={selectedCustomer.phone}', `placeholder="${z.phone}" value={selectedCustomer.phone}`],
  ['placeholder="????" value={selectedCustomer.address}', `placeholder="${z.addr}" value={selectedCustomer.address}`]
]

for (const [a, b] of reps) R(a, b)

// fix gender radios (broken by prior replace)
const genderBlock = `                      <div className="flex gap-4">
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="${z.male}" checked={selectedCustomer.gender === '${z.male}'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />${z.male}</label>
                        <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="${z.female}" checked={selectedCustomer.gender === '${z.female}'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })} />${z.female}</label>
                      </div>`
s = s.replace(
  /<motion.div className="flex gap-4">[\s\S]*?<\/div>\n                      <input type="tel"/,
  `${genderBlock}\n                      <input type="tel"`
)
s = s.replace(
  /<div className="flex gap-4">[\s\S]*?<\/div>\n                      <input type="tel" placeholder="手機號碼"/,
  `${genderBlock}\n                      <input type="tel" placeholder="${z.phone}"`
)
s = s.replace(
  /<div className="flex gap-4">[\s\S]*?<\/div>\n                      <input type="tel" placeholder="\u624b\u6a5f\u865f\u78bc"/,
  `${genderBlock}\n                      <input type="tel" placeholder="${z.phone}"`
)

// outer wrapper
s = s.replace(/<motion\.div className="fixed inset-0/, '<div className="fixed inset-0')
s = s.replace(/<\/motion\.div>\s*\)\s*\n\}/, '</motion.div>\n  )\n}')
s = s.replace(/<\/motion\.motion>\s*\)\s*\n\}/, '</motion.div>\n  )\n}')
s = s.replace(/<\/motion\.div>\s*\)\s*\n\}/, '</motion.div>\n  )\n}')
s = s.replace(/<\/div>\s*<\/div>\s*\)\s*\n\}/m, '</motion.div>\n  )\n}')

// price tag
s = s.replace(
  /<motion.div className="font-black text-amber-600 text-xl mt-1">\$\{order\.totals\.finalPrice\}<\/motion.div>/,
  '<div className="font-black text-amber-600 text-xl mt-1">${order.totals.finalPrice}</div>'
)
s = s.replace(
  /<div className="font-black text-amber-600 text-xl mt-1">\$\{order\.totals\.finalPrice\}<\/motion.div>/,
  '<div className="font-black text-amber-600 text-xl mt-1">${order.totals.finalPrice}</div>'
)

// avatar circle
s = s.replace(
  /<div className=\{`w-20 h-20 rounded-full[\s\S]*?<UserIcon size=\{40\} \/>\n                  <\/div>/,
  (m) => m.replace('<div className={`w-20', '<div className={`w-20')
)

fs.writeFileSync(target, s, 'utf8')
console.log('remaining ??', (s.match(/\?{2,}/g) || []).length)
console.log('remaining motion', (s.match(/motion\.div/g) || []).length)
