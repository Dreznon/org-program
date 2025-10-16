import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Item } from '../types';
import { itemsApi } from '../lib/api';

interface ItemListProps {
  items: Item[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearch: (query: string) => void;
  onItemDeleted: (itemId: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  loading,
  error,
  searchQuery,
  onSearch,
  onItemDeleted,
}) => {
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setDeleteLoading(itemId);
      console.log('Deleting item:', itemId);
      await itemsApi.deleteItem(itemId);
      console.log('Item deleted successfully');
      onItemDeleted(itemId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to delete item: ${errorMessage}`);
      console.error('Error deleting item:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading items...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="item-list">
      <div className="search-section" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <h1 className="section-title" style={{ margin:0 }}>Your Collection</h1>
        <Link to="/how-to" className="help-pill">Help</Link>
      </div>
      <div className="search-section">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => { e.stopPropagation(); }}
          className="search-rounded"
        />
      </div>

      {/* Group items by subjects (categories). Only show categories with items. */}
      {items.length === 0 ? (
        <div className="no-items">
          <p>No items found.</p>
          <Link to="/create" className="create-link">Create your first item</Link>
        </div>
      ) : (
        (() => {
          // Pick a single, best category per item to avoid duplicates across multiple categories
          const normalize = (s: string) => s.trim().toLowerCase();
          const priority: string[] = ["fan art", "art", "architecture", "places"]; // simple priority for now

          const pickCategory = (subjects: string[] | undefined): string => {
            const normalized = (subjects || [])
              .map(normalize)
              .filter(Boolean)
              .filter((s) => !s.startsWith("artist:")); // ignore artist: tags as categories

            for (const p of priority) {
              if (normalized.includes(p)) return p;
            }
            if (normalized.length > 0) return normalized[0];
            return "uncategorized";
          };

          const buckets = new Map<string, Item[]>();
          for (const it of items) {
            const key = pickCategory(it.subjects);
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key)!.push(it);
          }

          const entries = Array.from(buckets.entries()).sort((a, b) => a[0].localeCompare(b[0]));

          return (
            <div className="categories">
              {entries.map(([category, list]) => (
                <div key={category} className="category-block">
                  <h2 className="category-title">{category}</h2>
                  <div className="items-grid">
                    {list.map((item) => (
                      <Link key={item.id} to={`/item/${item.id}`} className="list-row" style={{ textDecoration:'none', color:'inherit' }}>
                        <div>
                          <div className="item-title" style={{ margin:0 }}>{item.title}</div>
                          <div className="item-description" style={{ margin:0 }}>{item.subjects?.length ? `tags: ${item.subjects.join(', ')}` : ''}</div>
                        </div>
                        <div className="chevron">›</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
};

export default ItemList;