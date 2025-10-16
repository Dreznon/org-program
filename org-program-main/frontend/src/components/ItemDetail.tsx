import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Item } from '../types';
import { itemsApi, assetsApi } from '../lib/api';
import { API_BASE } from '../lib/api';

interface ItemDetailProps {
  onItemUpdated: (item: Item) => void;
  onItemDeleted: (itemId: string) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchItem = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching item:', itemId);
      const data = await itemsApi.getItem(itemId);
      console.log('Item fetched successfully:', data);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch item: ${errorMessage}`);
      console.error('Error fetching item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploading(true);
      console.log('Uploading file:', file.name, 'for item:', id);
      await assetsApi.uploadAsset(id, file);
      console.log('File uploaded successfully');
      // Refresh the item to get updated assets
      await fetchItem(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to upload file: ${errorMessage}`);
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="loading">Loading item...</div>;
  }

  if (error || !item) {
    return <div className="error">Error: {error || 'Item not found'}</div>;
  }

  return (
    <div className="item-detail">
      <div className="item-detail-header">
        <Link to="/" className="back-link">← Back</Link>
        <div className="item-actions">
          <Link to={`/edit/${item.id}`} className="btn btn-secondary">Edit</Link>
          <Link to="/" className="btn btn-secondary">Move Category</Link>
          <Link to="/" className="btn btn-primary">Close</Link>
        </div>
      </div>

      <div className="item-detail-content">
        <h1 className="item-title">{item.title}</h1>
        
        {item.description && (
          <div className="item-section">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>
        )}

        <div className="item-metadata">
          <div className="metadata-grid">
            {item.date && (
              <div className="metadata-item">
                <strong>Date:</strong> {item.date}
              </div>
            )}
            {item.type && (
              <div className="metadata-item">
                <strong>Type:</strong> {item.type}
              </div>
            )}
            {item.format && (
              <div className="metadata-item">
                <strong>Format:</strong> {item.format}
              </div>
            )}
            {item.publisher && (
              <div className="metadata-item">
                <strong>Publisher:</strong> {item.publisher}
              </div>
            )}
            {item.language && (
              <div className="metadata-item">
                <strong>Language:</strong> {item.language}
              </div>
            )}
            {item.source && (
              <div className="metadata-item">
                <strong>Source:</strong> {item.source}
              </div>
            )}
          </div>

          {item.creators.length > 0 && (
            <div className="metadata-item">
              <strong>Creators:</strong> {item.creators.join(', ')}
            </div>
          )}

          {item.contributors.length > 0 && (
            <div className="metadata-item">
              <strong>Contributors:</strong> {item.contributors.join(', ')}
            </div>
          )}

          {item.subjects.length > 0 && (
            <div className="metadata-item">
              <strong>Subjects:</strong> {item.subjects.join(', ')}
            </div>
          )}

          {item.identifiers.length > 0 && (
            <div className="metadata-item">
              <strong>Identifiers:</strong> {item.identifiers.join(', ')}
            </div>
          )}

          <div className="metadata-item">
            <strong>Created:</strong> {formatDate(item.created_at)}
          </div>
          <div className="metadata-item">
            <strong>Updated:</strong> {formatDate(item.updated_at)}
          </div>
        </div>

        <div className="item-section">
          <h3>Assets</h3>
          <div className="upload-section">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="file-input"
            />
            {uploading && <span className="upload-status">Uploading...</span>}
          </div>

          {item.assets.length === 0 ? (
            <p className="no-assets">No assets uploaded yet.</p>
          ) : (
            <div className="assets-list">
              {item.assets.map((asset) => (
                <div key={asset.id} className="asset-item">
                  <div className="asset-info">
                    <strong>{asset.file_path.split('/').pop()}</strong>
                    <span className="asset-size">{formatFileSize(asset.bytes)}</span>
                    <span className="asset-type">{asset.mime_type}</span>
                  </div>
                  {/* Link to open the stored asset in a new tab */}
                  {asset.file_path && (
                    <div className="asset-actions">
                      {(() => {
                        // Normalize Windows path separators to URL-friendly slashes
                        const normalized = asset.file_path.replace(/\\/g, '/');
                        const href = `${API_BASE}/${normalized}`;
                        return (
                          <a href={href} target="_blank" rel="noreferrer" className="btn btn-link">
                            Open file
                          </a>
                        );
                      })()}
                    </div>
                  )}
                  {asset.ocr_json?.text && (
                    <div className="ocr-text">
                      <strong>OCR Text:</strong>
                      <p>{asset.ocr_json.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;