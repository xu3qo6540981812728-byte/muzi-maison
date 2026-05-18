import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/components/admin/AdminCustomersModal.jsx')
let s = fs.readFileSync(target, 'utf8')

const prev = '\u4e0a\u4e00\u9801'
const next = '\u4e0b\u4e00\u9801'
const load = '\u5f9e\u8cc7\u6599\u5eab\u8f09\u5165\u66f4\u591a\u5ba2\u6236\u2026'
const cancel = '\u53d6\u6d88'
const restore = '\u9084\u539f\u5ba2\u6236\u8cc7\u6599'

const btnQ = '                    ???\r\n                  </button>'
const btnQ2 = '                    ???\n                  </button>'
const marker = btnQ.includes('\r\n') ? btnQ : btnQ2

const parts = s.split(marker)
if (parts.length === 3) {
  s = parts[0] + `                    ${prev}${marker.includes('\r') ? '\r\n' : '\n'}                  </button>` + parts[1] + `                    ${next}${marker.includes('\r') ? '\r\n' : '\n'}                  </button>` + parts[2]
} else {
  console.warn('btn split parts', parts.length)
}

s = s.replace(/                      \?{10,}\r?\n                    <\/button>/, `                      ${load}\r\n                    </button>`)
s = s.replace(/\n                          \?\?\r?\n                        <\/button>/, `\n                          ${cancel}\r\n                        </button>`)
s = s.replace(/\n                            \?{4,}\r?\n                          <\/button>/, `\n                            ${restore}\r\n                          </button>`)

fs.writeFileSync(target, s, 'utf8')
console.log('remaining ??', (s.match(/\?{2,}/g) || []).length)
