import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  MessageSquare,
  Boxes,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ShoppingCart, label: 'Siparişler' },
  { to: '/products', icon: Package, label: 'Ürünler & Stok' },
  { to: '/shipments', icon: Truck, label: 'Kargo Takibi' },
  { to: '/assistant', icon: MessageSquare, label: 'AI Asistan' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Boxes size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">AI OrderOps</h1>
            <p className="text-[10px] text-slate-400 leading-tight">Operasyon Asistanı</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/60">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          YZTA 5.0 Hackathon
          <br />
          AI Hackathon Kategorisi
        </p>
      </div>
    </aside>
  )
}
