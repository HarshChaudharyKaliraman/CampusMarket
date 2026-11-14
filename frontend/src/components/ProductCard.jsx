import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const imageUrl = product.image
    ? `http://localhost:5000/uploads/${product.image}`
    : null;

  return (
    <Link to={`/products/${product._id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-card-img-wrap">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="product-card-img" />
          ) : (
            <div className="product-card-img-placeholder">No Image</div>
          )}
        </div>
        <div className="product-card-body">
          <span className="product-card-category">{product.category}</span>
          <h3 className="product-card-title">{product.name}</h3>
          <p className="product-card-price">₹{product.price}</p>
        </div>
      </div>
    </Link>
  );
}
