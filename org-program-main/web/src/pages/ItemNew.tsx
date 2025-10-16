import { useState } from 'react'

export default function ItemNew() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('')
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 12 }}>
      <h2>New Item</h2>
      <label style={{ display: 'grid', gap: 6 }}><span>Name</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (required)"/></label>
      <label style={{ display: 'grid', gap: 6 }}><span>Description</span><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)"/></label>
      <label style={{ display: 'grid', gap: 6 }}><span>Tags</span><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags (comma)"/></label>
      <label style={{ display: 'grid', gap: 6 }}><span>Quantity</span><input type="number" min={1} value={quantity} onChange={e=>setQuantity(Math.max(1, Math.floor(Number(e.target.value)||1)))} /></label>
      <label style={{ display: 'grid', gap: 6 }}><span>Category</span><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (optional)"/></label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <a href="/">Cancel</a>
        <button>Save</button>
      </div>
    </div>
  )
}


