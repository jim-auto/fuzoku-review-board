import { Outlet } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      <div className="border-b border-neon-amber/30 bg-neon-amber/10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-start gap-2 text-neon-amber">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">
            デモサイトです。掲載店舗・キャスト・料金・割引・URLはすべて架空のサンプルデータで、実在店舗とは関係ありません。検索や予約には利用できません。
          </p>
        </div>
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
