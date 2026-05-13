import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 h-full">{children}</div>
      </main>
    </div>
  )
}
