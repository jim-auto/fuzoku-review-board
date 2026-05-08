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
            <p className="text-xs text-text-dim">架空データの検索UIデモ</p>
          </div>

          {/* Disclaimer */}
          <div className="max-w-sm">
            <p className="text-xs text-text-dim leading-relaxed">
              本サイトはUI/検索体験の検証用デモです。
              掲載店舗・キャスト・料金・割引・URLは架空のサンプルで、実在店舗とは関係ありません。
              予約・来店・問い合わせには利用できません。
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
