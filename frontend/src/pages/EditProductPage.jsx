import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Others'];

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Books',
  });
  const [currentImage, setCurrentImage] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setFetchLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        
        const sellerId = data.seller?._id || data.seller;
        const userId = user?._id || user?.id;
        if (String(sellerId) !== String(userId)) {
          navigate('/my-listings');
          return;
        }
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
        });
        setCurrentImage(data.image || '');
      } catch {
        setError('Failed to load product.');
      } finally {
        setFetchLoading(false);
      }
    }
    loadProduct();
  }, [id, navigate, user]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e) {
    setImage(e.target.files[0] || null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('category', form.category);
      if (image) fd.append('image', image);
      await api.put(`/products/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) return <div className="loading">Loading product...</div>;

  return (
    <div className="form-page" style={{ maxWidth: 560 }}>
      <h1>Edit Listing</h1>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              type="number"
              name="price"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="image">New Image (optional)</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {currentImage && (
              <p className="current-image-note">
                Current image: <strong>{currentImage}</strong>
              </p>
            )}
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/my-listings')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
