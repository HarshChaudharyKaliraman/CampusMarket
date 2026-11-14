import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?._id || user?.id;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/products');
      const mine = data.filter(
        p => p.seller?._id === userId || p.seller === userId
      );
      setListings(mine);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      setListings(prev => prev.filter(p => p._id !== id));
    } catch {
      alert('Failed to delete product.');
    }
  }

  return (
    <div className="container">
      <div className="listings-header">
        <h1>My Listings</h1>
        <Link to="/add-product" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Add New
        </Link>
      </div>

      {loading && <div className="loading">Loading your listings...</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && listings.length === 0 && (
        <div className="empty-state">
          You haven't listed anything yet.{' '}
          <Link to="/add-product" style={{ color: '#2563eb' }}>Add your first item</Link>.
        </div>
      )}

      {!loading && listings.map(product => {
        const imageUrl = product.image
          ? `http://localhost:5000/uploads/${product.image}`
          : null;
        return (
          <div key={product._id} className="listing-card">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="listing-card-img" />
            ) : (
              <div className="listing-card-img-placeholder">No Image</div>
            )}
            <div className="listing-card-body">
              <div className="listing-card-title">{product.name}</div>
              <div className="listing-card-price">₹{product.price}</div>
              <div className="listing-card-actions">
                <button
                  className="btn-sm btn-sm-primary"
                  onClick={() => navigate(`/edit-product/${product._id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn-sm btn-sm-danger"
                  onClick={() => handleDelete(product._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
