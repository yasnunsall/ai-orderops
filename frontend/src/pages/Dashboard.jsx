import { useEffect, useState } from 'react'
import { ShoppingCart, Package, AlertTriangle, Truck } from 'lucide-react'
import StatCard from '../components/StatCard'
import { getDailySummary } from '../services/api'

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function StatusRow({ label, value, color }) {
  const cls = {
    green:  'bg-green-100 text-green-700',
    blue:   'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls[color]}`}>
        {value}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getDailySummary()
      .then((res) => setSummary(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        ⚠️ Backend'e bağlanılamadı. Backend'in çalıştığından emin olun.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-0.5">Günlük operasyon özeti</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Sipariş"
          value={summary?.total_orders}
          subtitle="Tüm siparişler"
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Hazırlanan Sipariş"
          value={summary?.preparing_orders}
          subtitle="Kargoya hazır"
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Kritik Stok"
          value={summary?.critical_products}
          subtitle="Eşik altı ürünler"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Gecikme Riski"
          value={summary?.delayed_shipments}
          subtitle="Risk altındaki kargo"
          icon={Truck}
          color="yellow"
        />
      </div>

      {/* Lower panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">🎯 Öncelikli Görevler</h3>
          {summary?.priority_tasks?.length > 0 ? (
            <ul className="space-y-2.5">
              {summary.priority_tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {task}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-600 font-medium">✅ Bugün kritik görev yok</p>
          )}
        </div>

        {/* Order Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-3">📦 Sipariş Dağılımı</h3>
          <div className="divide-y divide-slate-100">
            <StatusRow label="Teslim Edildi"  value={summary?.delivered_orders}  color="green"  />
            <StatusRow label="Kargoda"        value={summary?.in_transit_orders}  color="blue"   />
            <StatusRow label="Hazırlanıyor"   value={summary?.preparing_orders}   color="purple" />
            <StatusRow label="Beklemede"      value={summary?.pending_orders}     color="yellow" />
          </div>
        </div>
      </div>

      {/* Critical stock alert */}
      {summary?.orders_breakdown?.critical_stock?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">
            🔴 Kritik Stok Uyarısı
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.orders_breakdown.critical_stock.map((p) => (
              <span
                key={p.product}
                className="text-xs bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-full"
              >
                {p.product} — {p.stock} adet
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
