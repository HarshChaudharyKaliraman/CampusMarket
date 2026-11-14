import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
        Go Home
      </Link>
    </div>
  );
}
