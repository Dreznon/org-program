import { Link } from 'react-router-dom'

export default function AppHeader() {
  return (
    <header style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E2E8F0', zIndex: 10 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>My Collection</h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/how-to">How to Use</Link>
        <Link to="/upload">Upload</Link>
      </nav>
    </header>
  )
}


