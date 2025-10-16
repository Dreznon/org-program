import { useParams, Link } from 'react-router-dom'

export default function ItemShow() {
  const { id } = useParams()
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Item {id}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/">Cancel</Link>
          <button>Advanced</button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {['Description','Quantity','Date','Format','Subjects'].map((k)=> (
          <div key={k} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 10 }}>
            <strong>{k}: </strong>
            <span>-</span>
          </div>
        ))}
      </div>
    </div>
  )
}


