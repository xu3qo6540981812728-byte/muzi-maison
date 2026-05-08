import { X } from '../Icons'

export default function AdminLogsModal({ onClose, adminLogs, formatAdminLog }) {
  return (
    <div className="fixed inset-0 z-[65] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
      <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-4xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full">
          <X size={24} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-5 flex items-center gap-2 border-b border-stone-200 pb-3">
          管理員操作紀錄
        </h2>
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {adminLogs.length === 0 ? (
            <div className="text-sm text-stone-400 text-center py-10">目前尚無操作紀錄</div>
          ) : (
            adminLogs.map((log) => {
              const readable = formatAdminLog(log)
              return (
                <div key={log.id} className="bg-white border border-stone-200 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-stone-700 text-sm">{readable.title}</p>
                    <p className="text-xs text-stone-400 shrink-0">
                      {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : '-'}
                    </p>
                  </div>
                  <p className="text-sm text-stone-700 mt-1">{readable.summary}</p>
                  <p className="text-xs text-stone-500 mt-2">管理員：{log.adminEmail || log.adminUid || '-'}</p>
                  {readable.changes?.length > 0 && (
                    <div className="mt-2 bg-stone-50 border border-stone-100 rounded-lg p-2 space-y-1">
                      {readable.changes.map((c, idx) => (
                        <div key={`${log.id}-${idx}`} className="text-xs text-stone-600">
                          <span className="font-bold text-stone-700">{c.label || c.field}</span>
                          <span className="mx-1 text-stone-400">：</span>
                          <span className="text-rose-600">{c.before}</span>
                          <span className="mx-1 text-stone-400">→</span>
                          <span className="text-emerald-700">{c.after}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
