import { Link } from 'react-router-dom'

export default function BottomBar() {
  return (
    <Link to="/upload" style={{ position:'fixed', left:'50%', transform:'translateX(-50%)', bottom:20, padding:'14px 18px', borderRadius:999, background:'linear-gradient(90deg, #60a5fa, #3b82f6)', color:'#fff', border:'none', fontWeight:700, letterSpacing:.3, boxShadow:'0 8px 26px rgba(59,130,246,.35)', textDecoration:'none' }}>
      + Add to Collection
    </Link>
  )
}


