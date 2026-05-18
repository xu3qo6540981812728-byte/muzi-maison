import { UserIcon } from '../Icons'

function formatConsentShort(user) {
  if (user.electronicPrivacyConsent === 'none') return '無電子同意'
  if (user.privacyConsentVersion) return `已同意 v${user.privacyConsentVersion}`
  return '—'
}

export default function CustomerTable({ customers, onSelectCustomer }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-inner -mx-1">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-stone-100 sticky top-0 z-10 shadow-sm">
          <tr className="text-[11px] md:text-xs text-stone-600 font-black uppercase tracking-wide">
            <th className="px-3 py-3 border-b border-stone-200 whitespace-nowrap">姓名</th>
            <th className="px-3 py-3 border-b border-stone-200 whitespace-nowrap">性別</th>
            <th className="px-3 py-3 border-b border-stone-200 whitespace-nowrap">電話</th>
            <th className="px-3 py-3 border-b border-stone-200 whitespace-nowrap min-w-[160px]">Email</th>
            <th className="px-3 py-3 border-b border-stone-200 whitespace-nowrap">LINE ID</th>
            <th className="px-3 py-3 border-b border-stone-200 whitespace-nowrap min-w-[140px]">個資同意</th>
            <th className="px-3 py-3 border-b border-stone-200 whitespace-nowrap text-center w-24">狀態</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((user) => (
            <tr
              key={user.id}
              onClick={() => onSelectCustomer({ ...user })}
              className={`text-xs border-b border-stone-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${
                user.role === 'deleted' ? 'opacity-75 bg-rose-50/30' : ''
              }`}
            >
              <td className="px-3 py-2.5 align-top font-bold text-stone-800">
                <span className="inline-flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <UserIcon size={16} />
                  </span>
                  {user.name || '—'}
                </span>
              </td>
              <td className="px-3 py-2.5 align-top text-stone-600">{user.gender || '—'}</td>
              <td className="px-3 py-2.5 align-top font-mono text-stone-700 whitespace-nowrap">
                {user.phone || '—'}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-[11px] text-stone-600 break-all max-w-[200px]">
                {user.email || '（無）'}
              </td>
              <td className="px-3 py-2.5 align-top text-[#06C755] font-bold">{user.lineId || '—'}</td>
              <td className="px-3 py-2.5 align-top text-[11px] text-stone-600">{formatConsentShort(user)}</td>
              <td className="px-3 py-2.5 align-top text-center">
                {user.role === 'deleted' ? (
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">停用</span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">正常</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
