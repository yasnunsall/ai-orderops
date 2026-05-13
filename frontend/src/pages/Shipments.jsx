import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Truck } from 'lucide-react'
import { getOrders } from '../services/api'

const STATUS_CFG = {
  teslim_edildi: { label: 'Teslim Edildi', cls: 'bg-green-100 text-green-700' },
  kargoda:       { label: 'Kargoda',       cls: 'bg-blue-100 text-blue-700'  },
  hazirlaniyor:  { label: 'Hazırlanıyor',  cls: 'bg-purple-100 text-purple-700' },
  beklemede:     { label: 'Beklemede',     cls: 'bg-yellow-100 text-yellow-700' },
}

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders()
      .then((r) => setShipments(r.data.filter((o) => o.cargo_company)))
      .finally(() => setLoading(false))
  }, [])

  const delayed = shipments.filter((o) => o.delay_risk)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Kargo Takibi</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {shipments.length} aktif kargo
          {delayed.length > 0 && (
            <span className="ml-2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              {delayed.length} gecikme riski
            </span>
          )}
        </p>
      </div>

      {/* Delayed cards */}
      {delayed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
            <AlertTriangle size={15} /> Gecikme Riski Olan Kargolar
          </h3>
          {delayed.map((o) => (
            <div key={o.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Sipariş #{o.order_id} — {o.customer_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {o.product_name} × {o.quantity}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                  ⚠️ Gecikme Riski
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-500">
                <p><span className="font-medium text-slate-700">Kargo:</span> {o.cargo_company}</p>
                <p><span className="font-medium text-slate-700">Takip No:</span> {o.tracking_number || '—'}</p>
                <p><span className="font-medium text-slate-700">Tahmini:</span> {o.estimated_delivery_date || '—'}</p>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Durum:</span> {o.tracking_status}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* All shipments table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-3">
          <Truck size={15} /> Tüm Kargolar
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['SİPARİŞ NO', 'MÜŞTERİ', 'KARGO FİRMASI', 'TAKİP NO', 'TAKİP DURUMU', 'TESLİMAT TARİHİ', 'DURUM'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">Yükleniyor...</td>
                  </tr>
                ) : (
                  shipments.map((o) => {
                    const s = STATUS_CFG[o.order_status] ?? { label: o.order_status, cls: 'bg-slate-100 text-slate-600' }
                    return (
                      <tr key={o.id} className={`hover:bg-slate-50 transition-colors ${o.delay_risk ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-3 font-semibold text-blue-600">#{o.order_id}</td>
                        <td className="px-4 py-3 text-slate-700">{o.customer_name}</td>
                        <td className="px-4 py-3 text-slate-600">{o.cargo_company}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs font-mono">{o.tracking_number || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{o.tracking_status}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{o.estimated_delivery_date || '—'}</td>
                        <td className="px-4 py-3">
                          {o.delay_risk ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                              <AlertTriangle size={12} /> Risk
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                              <CheckCircle size={12} /> Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
