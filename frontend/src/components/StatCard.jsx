const PALETTE = {
  blue:   { card: 'border-blue-100',   icon: 'bg-blue-100 text-blue-600',   val: 'text-slate-800' },
  green:  { card: 'border-green-100',  icon: 'bg-green-100 text-green-600',  val: 'text-slate-800' },
  yellow: { card: 'border-yellow-100', icon: 'bg-yellow-100 text-yellow-600', val: 'text-slate-800' },
  red:    { card: 'border-red-100',    icon: 'bg-red-100 text-red-600',     val: 'text-red-600'   },
  purple: { card: 'border-purple-100', icon: 'bg-purple-100 text-purple-600', val: 'text-slate-800' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const p = PALETTE[color] ?? PALETTE.blue
  return (
    <div className={`bg-white rounded-xl border ${p.card} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${p.val}`}>{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${p.icon}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  )
}
