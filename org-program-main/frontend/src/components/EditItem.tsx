import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Item, ItemUpdate } from '../types';
import { itemsApi } from '../lib/api';

interface EditItemProps {
  onItemUpdated: (item: Item) => void;
}

const EditItem: React.FC<EditItemProps> = ({ onItemUpdated }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemUpdate>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchItem = async (itemId: string) => {
    try {
      setLoading(true);
      console.log('Fetching item for edit:', itemId);
      const data = await itemsApi.getItem(itemId);
      console.log('Item fetched for edit:', data);
      setItem(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        date: data.date || '',
        type: data.type || '',
        format: data.format || '',
        coverage: data.coverage || '',
        rights: data.rights || '',
        publisher: data.publisher || '',
        language: data.language || '',
        source: data.source || '',
        creators: data.creators,
        contributors: data.contributors,
        subjects: data.subjects,
        identifiers: data.identifiers,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to fetch item: ${errorMessage}`);
      console.error('Error fetching item:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [name]: array,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    try {
      setLoading(true);
      console.log('Updating item:', id, formData);
      const updatedItem = await itemsApi.updateItem(id, formData);
      console.log('Item updated successfully:', updatedItem);
      onItemUpdated(updatedItem);
      navigate(`/item/${id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to update item: ${errorMessage}`);
      console.error('Error updating item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !item) {
    return <div className="loading">Loading item...</div>;
  }

  if (!item) {
    return <div className="error">Item not found</div>;
  }

  return (
    <div className="edit-item">
      <div className="edit-item-header">
        <h1>Edit Item</h1>
        <div className="header-actions">
          <button type="button" onClick={() => setShowAdvanced(true)} className="btn btn-secondary">Advanced</button>
          <button onClick={() => navigate(`/item/${id}`)} className="btn btn-secondary">Cancel</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="item-form">
        {/* Primary fields visible */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={4}
            className="form-textarea"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="text"
              id="date"
              name="date"
              value={formData.date || ''}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="format">Format</label>
            <input
              type="text"
              id="format"
              name="format"
              value={formData.format || ''}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subjects">Subjects (comma-separated)</label>
          <input
            type="text"
            id="subjects"
            name="subjects"
            value={formData.subjects?.join(', ') || ''}
            onChange={handleArrayInputChange}
            placeholder="History, Science, Art"
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding:'14px 18px' }}>
            {loading ? 'Updating...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(`/item/${id}`)} className="btn btn-secondary">Cancel</button>
        </div>
      </form>

      {/* Advanced modal with secondary fields */}
      {showAdvanced && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Advanced metadata</h3>
              <button type="button" className="btn btn-light" onClick={() => setShowAdvanced(false)}>Close</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <input type="text" id="type" name="type" value={formData.type || ''} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="publisher">Publisher</label>
                  <input type="text" id="publisher" name="publisher" value={formData.publisher || ''} onChange={handleInputChange} className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <input type="text" id="language" name="language" value={formData.language || ''} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="source">Source</label>
                  <input type="text" id="source" name="source" value={formData.source || ''} onChange={handleInputChange} className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="coverage">Coverage</label>
                  <input type="text" id="coverage" name="coverage" value={formData.coverage || ''} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="rights">Rights</label>
                  <input type="text" id="rights" name="rights" value={formData.rights || ''} onChange={handleInputChange} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="creators">Creators (comma-separated)</label>
                <input type="text" id="creators" name="creators" value={formData.creators?.join(', ') || ''} onChange={handleArrayInputChange} placeholder="John Doe, Jane Smith" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="contributors">Contributors (comma-separated)</label>
                <input type="text" id="contributors" name="contributors" value={formData.contributors?.join(', ') || ''} onChange={handleArrayInputChange} placeholder="John Doe, Jane Smith" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="identifiers">Identifiers (comma-separated)</label>
                <input type="text" id="identifiers" name="identifiers" value={formData.identifiers?.join(', ') || ''} onChange={handleArrayInputChange} placeholder="ISBN:123456789, DOI:10.1000/123" className="form-input" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdvanced(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditItem;