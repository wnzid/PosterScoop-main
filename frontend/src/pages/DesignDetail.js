import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { priceList } from '../utils/priceList';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotificationContext';
import { formatCurrency } from '../utils/currency';
import DesignCard from '../components/DesignCard';
import '../App.css';
import API_BASE from '../utils/apiBase';
import getImageUrl from '../utils/getImageUrl';

function getThicknesses(type) {
  const entry = priceList[type];
  if (entry && !Array.isArray(entry)) return Object.keys(entry);
  return [];
}

function getSizes(type, thickness) {
  const entry = priceList[type];
  if (!entry) return [];
  if (Array.isArray(entry)) return entry;
  if (!thickness) return [];
  return entry[thickness] || [];
}

function getPrice(type, thickness, size) {
  const sizes = getSizes(type, thickness);
  const found = sizes.find((s) => s.size === size);
  return found ? found.price : 0;
}

function DesignDetail() {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [posterType, setPosterType] = useState('');
  const [thickness, setThickness] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const notify = useNotify();
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();
  const typeLabels = {
    'PVC Board Poster': 'PVC Board',
    'Sticker Poster': 'Sticker',
    'PVC Poster': 'PVC',
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/designs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setDesign(data);
        return getImageUrl(data.imageKey);
      })
      .then((url) => setImageUrl(url))
      .catch(() => setLoadError('Failed to load design'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!design?.categoryId) return;
    fetch(`${API_BASE}/api/designs?category_id=${design.categoryId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRelated(data.filter((d) => d.id !== design.id)))
      .catch(() => {});
  }, [design]);

  const thicknesses = getThicknesses(posterType);
  const sizes = getSizes(posterType, thickness);
  const price = getPrice(posterType, thickness, size) * qty;

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    if (!posterType || !size || (thicknesses.length > 0 && !thickness)) {
      setError('All fields are required');
      return;
    }
    addItem({
      title: design.title,
      image: design.imageKey,
      type: posterType,
      size,
      thickness: thicknesses.length > 0 ? thickness : '',
      price,
      quantity: qty,
    });
    fetch(`${API_BASE}/api/product-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ design_id: design.id }),
    }).catch(() => {});
    notify('Added to cart!');
  };

  if (loading) return <p>Loading...</p>;
  if (loadError) return <p className="error">{loadError}</p>;

  return (
    <>
      <div className="design-detail">
        <div className="design-preview">
          {imageUrl && (
            <img src={imageUrl} alt={design.title} loading="lazy" />
          )}
        </div>
        <form className="design-options" onSubmit={handleAdd}>
          <h2>{design.title}</h2>
          {error && <p className="error">{error}</p>}
          <select
            value={posterType}
            onChange={(e) => {
              setPosterType(e.target.value);
              setThickness('');
              setSize('');
            }}
          >
            <option value="">Select Type</option>
            {Object.keys(priceList).map((t) => (
              <option key={t} value={t}>
                {typeLabels[t] || t}
              </option>
            ))}
          </select>
          {thicknesses.length > 0 && (
            <select
              value={thickness}
              onChange={(e) => {
                setThickness(e.target.value);
                setSize('');
              }}
            >
              <option value="">Select Thickness</option>
              {thicknesses.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Select Size</option>
            {sizes.map((s) => (
              <option key={s.size} value={s.size}>
                {s.size}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
          />
          <p className="price">Price: {formatCurrency(price)}</p>
          <button type="submit">Add to Cart</button>
        </form>
      </div>
      {related.length > 0 && (
        <section className="related-section">
          <h3>More design like this</h3>
          <div className="design-grid">
            {related.map((d) => (
              <DesignCard key={d.id} design={d} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default DesignDetail;
