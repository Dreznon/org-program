import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJSONWithFallback, postJSONWithFallback } from '../api/client'
import Modal from '../components/Modal'

type Item = { id: string; name: string; description?: string; quantity?: number; date?: string; format?: string; subjects?: string[]; tags?: string[] }

export default function ItemShow() {
  const { id } = useParams()
  const [item, setItem] = useState<Item | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [adv, setAdv] = useState<Record<string, any>>({})

  useEffect(() => {
    let cancelled = false
    setError(null); setItem(null)
    getJSONWithFallback<Item>(`/api/items/${id}`)
      .then((data)=>{ if(!cancelled) setItem(data) })
      .catch((e:any)=>{ if(!cancelled) setError(e?.message||'Failed to load') })
    return () => { cancelled = true }
  }, [id])

  const saveAdvanced = async () => {
    try { await postJSONWithFallback(`/api/items/${id}/advanced`, adv) } catch {}
    setOpen(false)
  }

  return (
    <div className="container" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{item?.name || 'Item'}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/" className="btn btn-secondary">Cancel</Link>
          <button className="btn btn-secondary" onClick={()=>setOpen(true)}>Advanced</button>
        </div>
      </div>
      {item === null && !error && (<div aria-busy>Loading…</div>)}
      {error && (<div role="alert" style={{ color:'#b91c1c' }}>Failed to load item.</div>)}
      {item && (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {([
            ['Description', item.description || '-'],
            ['Quantity', String(item.quantity ?? '-')],
            ['Date', item.date || '-'],
            ['Format', item.format || '-'],
          ] as const).map(([k,v]) => (
            <div key={k} className="card pad-4"><strong>{k}: </strong><span>{v}</span></div>
          ))}
          <div className="card pad-4">
            <strong>Subjects: </strong>
            {(item.subjects || item.tags || []).map((s, i) => (
              <span key={i} style={{ display:'inline-block', marginRight:6, marginTop:4, padding:'4px 8px', borderRadius:999, background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.4)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {open && (
        <div className="modal-shell" onKeyDown={(e)=>{ if(e.key==='Escape') setOpen(false) }}>
          <div className="modal-backdrop" onClick={()=>setOpen(false)} />
          <div className="modal-card" role="dialog" aria-modal aria-labelledby="adv-title">
            <div className="modal-head"><h2 id="adv-title" style={{ margin:0 }}>Advanced Metadata</h2><button aria-label="Close" onClick={()=>setOpen(false)}>✕</button></div>
            <div className="modal-body" style={{ display:'grid', gap: 8 }}>
              {['type','publisher','language','source','coverage','rights','creators','contributors','identifiers'].map((k)=> (
                <label key={k} style={{ display:'grid', gap:6 }}>
                  <span style={{ color:'#64748b', fontSize:12 }}>{k}</span>
                  <input onChange={(e)=> setAdv(a=> ({...a, [k]: e.target.value}))} />
                </label>
              ))}
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button className="btn btn-secondary" onClick={()=>setOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveAdvanced}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


