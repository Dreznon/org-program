type Props = { title: string; count: number; onClick?: () => void }

export default function CategoryCard({ title, count, onClick }: Props) {
  return (
    <div tabIndex={0} onClick={onClick} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); onClick?.() } }} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:16, cursor:'pointer', boxShadow:'0 10px 25px rgba(2,6,23,.08)' }}>
      <div style={{ fontWeight:700, marginBottom:6 }}>{title}</div>
      <div style={{ color:'#64748b', fontSize:12 }}>{count} item{count!==1?'s':''}</div>
    </div>
  )
}


