import { useState } from 'react'
import { postJSONWithFallback } from '../api/client'
import Toast from '../components/Toast'

export default function Upload() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{text:string, tone?:'success'|'error'}|null>(null)

  function closeToast() { setToast(null) }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, color: '#64748b', fontSize: 12, flexWrap: 'wrap' }}>
        {['Enter','Categorize','Review','Save'].map((label, i) => (
          <div key={label} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #E2E8F0', background: i+1===step ? '#3B82F6' : 'transparent', color: i+1===step ? '#fff' : undefined }}>{i+1}. {label}</div>
        ))}
      </div>
      {step===1 && (
        <>
          <label style={{ display: 'grid', gap: 6 }}><span>Name</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (required)"/></label>
          <label style={{ display: 'grid', gap: 6 }}><span>Description</span><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)"/></label>
          <label style={{ display: 'grid', gap: 6 }}><span>Tags</span><input value={tags.join(', ')} onChange={e=>setTags(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Tags (comma)"/></label>
          <label style={{ display: 'grid', gap: 6 }}><span>Quantity</span><input type="number" min={1} value={quantity} onChange={e=>setQuantity(Math.max(1, Math.floor(Number(e.target.value)||1)))} /></label>
        </>
      )}
      {step===2 && (
        <div style={{ display:'grid', gap: 8 }}>
          <label style={{ display: 'grid', gap: 6 }}><span>Category</span><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category"/></label>
          {confidence !== null && (<div style={{ color:'#64748b' }}>Confidence: {Math.round(confidence*100)}%</div>)}
          {(confidence !== null && confidence < 0.5) && (<div role="alert" style={{ color:'#b45309' }}>Low confidence. Please pick a category.</div>)}
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-secondary" onClick={async ()=>{
              // re-categorize
              try{
                const res = await postJSONWithFallback<{category:string, confidence:number}>('/api/categorize', { title:name, description, tags, item_type:'manual' })
                setCategory(res.category||'')
                setConfidence(res.confidence ?? null)
              }catch{ setToast({text:'Categorize failed', tone:'error'}) }
            }}>Categorize</button>
            <button className="btn btn-secondary" onClick={()=> setConfidence(null)}>Change</button>
          </div>
        </div>
      )}
      {step===3 && (
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            ['Name', name||'-'], ['Description', description||'-'], ['Tags', tags.join(', ')||'-'], ['Quantity', String(quantity)], ['Category', category||'-']
          ].map(([k,v])=> (<div key={k as string} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 10 }}><strong>{k}:</strong> {v as string}</div>))}
        </div>
      )}
      {step===4 && (<p>Ready to save your item.</p>)}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={()=>setStep(Math.max(1, step-1))}>Back</button>
        <button className="btn btn-primary" onClick={async ()=>{
          if (step<2) { setStep(step+1); return }
          if (step===2) {
            try{
              const res = await postJSONWithFallback<{category:string, confidence:number}>('/api/categorize', { title:name, description, tags, item_type:'manual' })
              setCategory(res.category||category)
              setConfidence(res.confidence ?? null)
              setStep(3)
            }catch{ setToast({text:'Categorize failed', tone:'error'}) }
            return
          }
          if (step===3) { setStep(4); return }
          if (step===4) {
            try{
              setSaving(true)
              await postJSONWithFallback('/api/items', { title:name, description, tags, quantity, category_id: category })
              setToast({ text:'Saved!', tone:'success' })
              setName(''); setDescription(''); setTags([]); setQuantity(1); setCategory(''); setConfidence(null); setStep(1)
            } catch { setToast({ text:'Save failed', tone:'error' }) }
            finally { setSaving(false) }
          }
        }}>{step===4?'Save':'Next'}</button>
      </div>
      {toast && <div onAnimationEnd={closeToast}><Toast text={toast.text} tone={toast.tone} /></div>}
    </div>
  )
}


