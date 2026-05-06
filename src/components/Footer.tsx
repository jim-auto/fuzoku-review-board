export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <div
              className="text-xl font-black tracking-widest mb-1.5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span style={{ color: '#00d4ff' }}>FUZZ</span>
              <span style={{ color: '#ff2d78' }}>BOARD</span>
            </div>
            <p className="text-xs text-text-dim">風俗キャスト情報データベース</p>
          </div>

          {/* Disclaimer */}
          <div className="max-w-sm">
            <p className="text-xs text-text-dim leading-relaxed">
              本サイトに掲載されている情報はサンプルデータです。
              掲載情報の正確性・完全性を保証するものではありません。
              ご利用は自己責任でお願いします。
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-text-dim">© 2025 FUZZBOARD. All rights reserved.</p>
          <p className="text-xs text-text-dim">18歳未満の方のご利用はお断りします</p>
        </div>
      </div>
    </footer>
  )
}
