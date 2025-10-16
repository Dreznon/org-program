export default function HowTo() {
  const tips = [
    "Add items via 'Add to Collection'",
    'We auto-categorize by typical storage location',
    'Tap a category to see items; tap an item for details',
    "Unsure? Use 'Move Category' in the item sheet",
  ]
  return (
    <div className="container" aria-labelledby="howto-title">
      <button onClick={() => history.back()} className="btn btn-secondary" aria-label="Back">← Back</button>
      <h2 id="howto-title" style={{ fontSize: 40, marginTop: 16, marginBottom: 16 }}>How to Use</h2>
      <div style={{ display:'grid', gap: 12 }}>
        {tips.map((t, i) => (
          <div key={i} className="card pad-4" style={{ display:'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems:'center' }}>
            <div className="badge-number" aria-hidden>{i+1}</div>
            <div style={{ fontSize: 18, lineHeight: 1.4 }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


