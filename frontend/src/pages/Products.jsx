import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { getProducts } from '../services/api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false))
  }, [])

  const critical = products.filter((p) => p.is_critical)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ürünler & Stok</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {products.length} ürün
          {critical.length > 0 && (
            <span className="ml-2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              {critical.length} kritik stok
            </span>
          )}
        </p>
      </div>

      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Kritik Stok Uyarısı</p>
            <p className="text-xs text-red-600 mt-1">
              <strong>{critical.map((p) => p.product_name).join(', ')}</strong> ürünlerinde stok kritik
              seviyenin altına düştü. Tedarikçilerinize sipariş vermeniz önerilir.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['ÜRÜN ADI', 'STOK (ADET)', 'KRİTİK EŞİK', 'GÜNLÜK SATIŞ', 'TAHMINI TÜKENME', 'TEDARİKÇİ', 'BİRİM FİYAT', 'DURUM'].map((h) => (
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
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 transition-colors ${p.is_critical ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{p.product_name}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${p.is_critical ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.critical_stock_threshold}</td>
                    <td className="px-4 py-3 text-slate-500">{p.average_daily_sales} / gün</td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.days_until_stockout ? `~${p.days_until_stockout} gün` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.supplier_name}</td>
                    <td className="px-4 py-3 text-slate-500">₺{p.unit_price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {p.is_critical ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                          <AlertTriangle size={12} /> Kritik
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <CheckCircle size={12} /> Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
