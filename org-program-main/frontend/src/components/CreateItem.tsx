import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ItemCreate } from '../types';
import { itemsApi } from '../lib/api';

interface CreateItemProps {
  onItemCreated: (item: any) => void;
}

const CreateItem: React.FC<CreateItemProps> = ({ onItemCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ItemCreate>({
    title: '',
    description: '',
    date: '',
    type: '',
    format: '',
    coverage: '',
    rights: '',
    publisher: '',
    language: '',
    source: '',
    creators: [],
    contributors: [],
    subjects: [],
    identifiers: [],
  });

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
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating item:', formData);
      const newItem = await itemsApi.createItem(formData);
      console.log('Item created successfully:', newItem);
      onItemCreated(newItem);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to create item: ${errorMessage}`);
      console.error('Error creating item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-item">
      <div className="create-item-header">
        <h1>Create New Item</h1>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
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
            value={formData.description}
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
              value={formData.date}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
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
              value={formData.format}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="publisher">Publisher</label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <input
              type="text"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">Source</label>
            <input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="coverage">Coverage</label>
          <input
            type="text"
            id="coverage"
            name="coverage"
            value={formData.coverage}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rights">Rights</label>
          <input
            type="text"
            id="rights"
            name="rights"
            value={formData.rights}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="creators">Creators (comma-separated)</label>
          <input
            type="text"
            id="creators"
            name="creators"
            value={formData.creators?.join(', ') || ''}
            onChange={handleArrayInputChange}
            placeholder="John Doe, Jane Smith"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contributors">Contributors (comma-separated)</label>
          <input
            type="text"
            id="contributors"
            name="contributors"
            value={formData.contributors?.join(', ') || ''}
            onChange={handleArrayInputChange}
            placeholder="John Doe, Jane Smith"
            className="form-input"
          />
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

        <div className="form-group">
          <label htmlFor="identifiers">Identifiers (comma-separated)</label>
          <input
            type="text"
            id="identifiers"
            name="identifiers"
            value={formData.identifiers?.join(', ') || ''}
            onChange={handleArrayInputChange}
            placeholder="ISBN:123456789, DOI:10.1000/123"
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Item'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateItem;