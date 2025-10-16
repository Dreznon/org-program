type Props = { text: string }

export default function Toast({ text }: Props) {
  return (
    <div role="status" style={{ position:'fixed', bottom:20, right:20, background:'#111827', color:'#e5e7eb', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'8px 12px', boxShadow:'0 10px 25px rgba(0,0,0,.35)' }}>
      {text}
    </div>
  )
}


