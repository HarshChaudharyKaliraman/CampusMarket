import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      navigate('/');
    } catch {
      alert('Failed to delete product.');
      setDeleting(false);
    }
  }

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="container"><div className="error-msg">{error}</div></div>;
  if (!product) return null;

  const isOwner =
    isLoggedIn &&
    user &&
    product.seller &&
    (product.seller._id === (user._id || user.id) ||
      product.seller._id === user._id ||
      product.seller._id === user.id);

  const imageUrl = product.image
    ? `http://localhost:5000/uploads/${product.image}`
    : null;

  return (
    <div className="product-detail">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: '#2563eb', fontSize: '0.9rem' }}>← Back to listings</Link>
      </div>
      <div className="product-detail-grid">
        <div>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="product-detail-img" />
          ) : (
            <div className="product-detail-img-placeholder">No Image</div>
          )}
        </div>
        <div className="product-detail-info">
          <span className="product-detail-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-detail-price">₹{product.price}</p>
          <p className="product-detail-desc">{product.description}</p>

          {product.seller && (
            <div className="product-detail-seller">
              <h3>Seller Info</h3>
              <p><strong>{product.seller.name}</strong></p>
              {product.seller.email && <p>{product.seller.email}</p>}
              {product.seller.contactNumber && (
                <p>📞 {product.seller.contactNumber}</p>
              )}
            </div>
          )}

          {isOwner && (
            <div className="product-detail-actions">
              <Link
                to={`/edit-product/${product._id}`}
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                Edit
              </Link>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
