import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getOrders } from '../services/api'

const STATUS_CFG = {
  teslim_edildi: { label: 'Teslim Edildi', cls: 'bg-green-100 text-green-700' },
  kargoda:       { label: 'Kargoda',       cls: 'bg-blue-100 text-blue-700'  },
  hazirlaniyor:  { label: 'Hazırlanıyor',  cls: 'bg-purple-100 text-purple-700' },
  beklemede:     { label: 'Beklemede',     cls: 'bg-yellow-100 text-yellow-700' },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getOrders()
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(
    (o) =>
      o.order_id.includes(search) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.product_name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Siparişler</h2>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} sipariş</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sipariş, müşteri veya ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['SİPARİŞ NO', 'MÜŞTERİ', 'ÜRÜN', 'ADET', 'DURUM', 'KARGO FİRMASI', 'TAHMİNİ TESLİMAT', 'GECİKME RİSKİ'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">Yükleniyor...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">Sonuç bulunamadı</td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const s = STATUS_CFG[o.order_status] ?? { label: o.order_status, cls: 'bg-slate-100 text-slate-600' }
                  return (
                    <tr key={o.id} className={`hover:bg-slate-50 transition-colors ${o.delay_risk ? 'bg-red-50/40' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-blue-600">#{o.order_id}</td>
                      <td className="px-4 py-3 text-slate-700">{o.customer_name}</td>
                      <td className="px-4 py-3 text-slate-700">{o.product_name}</td>
                      <td className="px-4 py-3 text-slate-600">{o.quantity}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{o.cargo_company || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{o.estimated_delivery_date || '—'}</td>
                      <td className="px-4 py-3">
                        {o.delay_risk ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">⚠️ Risk</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
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
  )
}
