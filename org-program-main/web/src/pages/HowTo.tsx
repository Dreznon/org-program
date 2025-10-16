export default function HowTo() {
  const tips = [
    'Use “Add to Collection” to create items',
    'We auto-categorize by name and tags',
    'Browse categories and open item details',
    'Advanced lets you edit extended metadata',
  ]
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 12 }}>
      <h2>How to Use</h2>
      <p>Quick tips to get started:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {tips.map((t) => (
          <div key={t} style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: 12 }}>{t}</div>
        ))}
      </div>
      <p>Data is stored locally in your browser.</p>
    </div>
  )
}


