import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CastListPage from './pages/CastListPage'
import CastDetailPage from './pages/CastDetailPage'
import ShopDetailPage from './pages/ShopDetailPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="casts" element={<CastListPage />} />
          <Route path="casts/:id" element={<CastDetailPage />} />
          <Route path="shops/:id" element={<ShopDetailPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
