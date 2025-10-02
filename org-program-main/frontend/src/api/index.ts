import axios from 'axios';
import type { Item, ItemCreate, ItemUpdate, Asset } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Items API
export const itemsApi = {
  // Get all items with optional search
  getItems: async (searchQuery?: string): Promise<Item[]> => {
    const params = searchQuery ? { q: searchQuery } : {};
    const response = await api.get('/items', { params });
    return response.data;
  },

  // Get a single item by ID
  getItem: async (id: string): Promise<Item> => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  // Create a new item
  createItem: async (item: ItemCreate): Promise<Item> => {
    const response = await api.post('/items', item);
    return response.data;
  },

  // Update an existing item
  updateItem: async (id: string, item: ItemUpdate): Promise<Item> => {
    const response = await api.put(`/items/${id}`, item);
    return response.data;
  },

  // Delete an item
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};

// Assets API
export const assetsApi = {
  // Upload an asset for an item
  uploadAsset: async (itemId: string, file: File): Promise<Asset> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/items/${itemId}/assets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const response = await api.get('/');
    return response.data;
  },
};

export default api;