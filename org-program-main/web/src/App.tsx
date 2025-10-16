import { Routes, Route, Link, Navigate } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import BottomBar from './components/BottomBar'
import Home from './pages/Home'
import HowTo from './pages/HowTo'
import Upload from './pages/Upload'
import ItemShow from './pages/ItemShow'
import ItemNew from './pages/ItemNew'
import './App.css'

function App() {
  return (
    <div>
      <AppHeader />
      <main style={{ maxWidth: 1024, margin: '0 auto', padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-to" element={<HowTo />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/item/new" element={<ItemNew />} />
          <Route path="/item/:id" element={<ItemShow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomBar />
    </div>
  )
}

export default App
