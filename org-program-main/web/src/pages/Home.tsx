import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getJSONWithFallback } from '../api/client'
import CategoryCard from '../components/CategoryCard'

type Category = { id: string; name: string; count: number }

export default function Home() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    setError(null)
    setCategories(null)
    getJSONWithFallback<Category[]>('/api/categories')
      .then((data) => { if (!cancelled) setCategories(data) })
      .catch((e: any) => { if (!cancelled) setError(e?.message || 'Failed to load') })
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      {categories === null && !error && (
        <div aria-busy="true" style={{ color:'#64748b', padding: 16 }}>Loading categories…</div>
      )}
      {error && (
        <div role="alert" style={{ color:'#b91c1c', padding: 16 }}>Could not load categories. Using mock data if available.</div>
      )}
      {Array.isArray(categories) && categories.length === 0 && (
        <div style={{ color:'#64748b', padding: 40, textAlign:'center' }}>No categories yet. Use “Add to Collection” to create your first item.</div>
      )}
      {Array.isArray(categories) && categories.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {categories.map((c) => (
            <CategoryCard key={c.id} title={c.name} count={c.count} onClick={() => navigate(`/category/${encodeURIComponent(c.id)}`)} />
          ))}
        </div>
      )}
      <Link to="/upload" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', padding: '14px 18px', borderRadius: 999, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', color: '#fff', border: 0, fontWeight: 700, letterSpacing: 0.3, textDecoration:'none' }}>
        + Add to Collection
      </Link>
    </div>
  )
}


