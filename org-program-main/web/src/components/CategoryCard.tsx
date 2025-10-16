type Props = { title: string; count: number; onClick?: () => void }

export default function CategoryCard({ title, count, onClick }: Props) {
  return (
    <div tabIndex={0} onClick={onClick} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); onClick?.() } }} className="card pad-4" style={{ cursor:'pointer' }}>
      <div style={{ fontWeight:700, marginBottom:6 }}>{title}</div>
      <div style={{ color:'#64748b', fontSize:12 }}>{count} item{count!==1?'s':''}</div>
    </div>
  )
}


