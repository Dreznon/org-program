import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ title: string, onClose: () => void }>

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div aria-modal role="dialog" aria-labelledby="modal-title" style={{ position:'fixed', inset:0, display:'grid', placeItems:'center', zIndex: 40 }}>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)' }} />
      <div style={{ width: 'min(680px, calc(100% - 24px))', background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, boxShadow:'0 10px 25px rgba(2,6,23,.08)', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid #E2E8F0' }}>
          <h2 id="modal-title" style={{ margin:0 }}>{title}</h2>
          <button aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:'14px 16px' }}>{children}</div>
      </div>
    </div>
  )
}


