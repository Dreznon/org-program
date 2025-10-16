type Props = { text: string, tone?: 'success'|'error' }

export default function Toast({ text, tone = 'success' }: Props) {
  const bg = tone === 'success' ? '#064e3b' : '#7f1d1d'
  const border = tone === 'success' ? 'rgba(16,185,129,0.5)' : 'rgba(248,113,113,0.5)'
  return (
    <div role="status" aria-live="polite" style={{ position:'fixed', bottom:20, right:20, background:bg, color:'#e5e7eb', border:`1px solid ${border}`, borderRadius:12, padding:'8px 12px', boxShadow:'0 10px 25px rgba(0,0,0,.35)' }}>
      {text}
    </div>
  )
}


