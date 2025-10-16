export default function Home() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {/* Category cards would go here */}
      </div>
      <button style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', padding: '14px 18px', borderRadius: 999, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', color: '#fff', border: 0, fontWeight: 700, letterSpacing: 0.3 }}>
        + Add to Collection
      </button>
    </div>
  )
}


