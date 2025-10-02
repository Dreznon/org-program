import React, { useState } from 'react';
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
      <div className="search-section">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="items-grid">
        {items.length === 0 ? (
          <div className="no-items">
            <p>No items found.</p>
            <Link to="/create" className="create-link">Create your first item</Link>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <h3 className="item-title">{item.title}</h3>
                <div className="item-actions">
                  <Link to={`/item/${item.id}`} className="btn btn-primary">
                    View
                  </Link>
                  <Link to={`/edit/${item.id}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteLoading === item.id}
                    className="btn btn-danger"
                  >
                    {deleteLoading === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              
              {item.description && (
                <p className="item-description">{item.description}</p>
              )}
              
              <div className="item-meta">
                <span className="item-date">Created: {formatDate(item.created_at)}</span>
                {item.assets && item.assets.length > 0 && (
                  <span className="item-assets">{item.assets.length} asset(s)</span>
                )}
              </div>

              {item.creators.length > 0 && (
                <div className="item-creators">
                  <strong>Creators:</strong> {item.creators.join(', ')}
                </div>
              )}

              {item.subjects.length > 0 && (
                <div className="item-subjects">
                  <strong>Subjects:</strong> {item.subjects.join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItemList;