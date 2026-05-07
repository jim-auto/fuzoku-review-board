import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      navigate(`/shops?q=${encodeURIComponent(q)}`)
      setMenuOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <span
            className="text-xl font-black tracking-widest"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(90deg, #00d4ff, #b44fff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FUZZ
          </span>
          <span
            className="text-xl font-black tracking-widest"
            style={{
              fontFamily: 'var(--font-display)',
              color: '#ff2d78',
              textShadow: '0 0 12px rgba(255,45,120,0.5)',
            }}
          >
            BOARD
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-4">
          <NavLink
            to="/shops"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-neon-cyan' : 'text-text-muted hover:text-text-body'
              }`
            }
          >
            店舗を探す
          </NavLink>
          <NavLink
            to="/casts"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-neon-cyan' : 'text-text-muted hover:text-text-body'
              }`
            }
          >
            キャスト一覧
          </NavLink>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center w-64">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="名前・タグで検索..."
              className="input-base w-full pl-8 pr-4 py-1.5 text-sm rounded-full"
            />
          </div>
        </form>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 text-text-muted hover:text-text-body transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-dark-900 border-t border-dark-600 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="店舗名・ジャンルで検索..."
                className="input-base w-full pl-8 pr-4 py-2 text-sm rounded-full"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan rounded-full text-xs font-medium"
            >
              検索
            </button>
          </form>
          <NavLink
            to="/shops"
            className={({ isActive }) =>
              `block py-2 pl-3 text-sm border-l-2 transition-colors ${
                isActive
                  ? 'border-neon-cyan text-neon-cyan'
                  : 'border-dark-500 text-text-muted hover:text-text-body hover:border-dark-400'
              }`
            }
            onClick={() => setMenuOpen(false)}
          >
            店舗を探す
          </NavLink>
          <NavLink
            to="/casts"
            className={({ isActive }) =>
              `block py-2 pl-3 text-sm border-l-2 transition-colors ${
                isActive
                  ? 'border-neon-cyan text-neon-cyan'
                  : 'border-dark-500 text-text-muted hover:text-text-body hover:border-dark-400'
              }`
            }
            onClick={() => setMenuOpen(false)}
          >
            キャスト一覧
          </NavLink>
        </div>
      )}
    </header>
  )
}
