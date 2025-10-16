import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HowTo from './components/HowTo';
import { itemsApi } from './lib/api';
import type { Item } from './types';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import CreateItem from './components/CreateItem';
import EditItem from './components/EditItem';
import './App.css';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async (query?: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching items with query:', query || 'none');
      const data = await itemsApi.getItems(query);
      console.log('Items fetched successfully:', data);
      setItems(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch items: ${errorMessage}`);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search triggered with query:', query);
    setSearchQuery(query);
    fetchItems(query);
  };

  const handleItemCreated = (newItem: Item) => {
    console.log('Item created:', newItem);
    setItems(prev => [newItem, ...prev]);
  };

  const handleItemUpdated = (updatedItem: Item) => {
    console.log('Item updated:', updatedItem);
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleItemDeleted = (itemId: string) => {
    console.log('Item deleted:', itemId);
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  useEffect(() => {
    console.log('App mounted, fetching initial items');
    fetchItems();
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Organization App</h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/create" className="nav-link">Create Item</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <ItemList 
                  items={items}
                  loading={loading}
                  error={error}
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  onItemDeleted={handleItemDeleted}
                />
              } 
            />
            <Route 
              path="/item/:id" 
              element={
                <ItemDetail 
                  onItemUpdated={handleItemUpdated}
                  onItemDeleted={handleItemDeleted}
                />
              } 
            />
            <Route 
              path="/create" 
              element={
                <CreateItem 
                  onItemCreated={handleItemCreated}
                />
              } 
            />
            <Route 
              path="/edit/:id" 
              element={
                <EditItem 
                  onItemUpdated={handleItemUpdated}
                />
              } 
            />
          </Routes>
          <Routes>
            <Route path="/how-to" element={<HowTo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;