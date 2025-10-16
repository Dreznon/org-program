import { Link } from 'react-router-dom'

export default function AppHeader() {
  return (
    <header className="app-header">
      <h1 className="app-title">My Collection</h1>
      <nav className="app-nav">
        <Link to="/">Home</Link>
        <Link to="/how-to">How to Use</Link>
        <Link to="/upload">Upload</Link>
      </nav>
    </header>
  )
}


