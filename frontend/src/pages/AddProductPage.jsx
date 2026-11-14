import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Others'];

export default function AddProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Books',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e) {
    setImage(e.target.files[0] || null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!image) {
      setError('Please select an image.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('category', form.category);
      fd.append('image', image);
      await api.post('/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page" style={{ maxWidth: 560 }}>
      <h1>Add New Listing</h1>
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
            <label htmlFor="image">Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div style={{ marginTop: '1.2rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Posting…' : 'Add Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
