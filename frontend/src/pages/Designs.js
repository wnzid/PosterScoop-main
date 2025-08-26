import React, { useEffect, useState } from 'react';
import '../App.css';
import DesignCard from '../components/DesignCard';
import { MAIN_CATEGORIES } from '../utils/categories';
import API_BASE from '../utils/apiBase';

function Designs() {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // ignore category load errors
      } finally {
        setCategoriesLoaded(true);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categoriesLoaded) return;

    setLoading(true);
    setError(null);
    const query = selectedSub
      ? `?category_id=${selectedSub}`
      : selectedMain
      ? `?main_category=${selectedMain}`
      : '';
    fetch(`${API_BASE}/api/designs${query}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) =>
        setDesigns(
          data.map((d) => {
            const cat = categories.find((c) => c.id === d.categoryId) || {};
            return {
              ...d,
              category: cat.name || '',
              main_category: cat.main_category || '',
            };
          }),
        ),
      )
      .catch(() => setError('Failed to load designs'))
      .finally(() => setLoading(false));
  }, [selectedMain, selectedSub, categories, categoriesLoaded]);

  return (
    <section className="designs-page">
      <h2>All Designs</h2>
      <div className="design-filter">
        <select
          value={selectedMain}
          onChange={(e) => {
            setSelectedMain(e.target.value);
            setSelectedSub('');
          }}
        >
          <option value="">All Categories</option>
          {MAIN_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={selectedSub}
          onChange={(e) => setSelectedSub(e.target.value)}
          disabled={!selectedMain}
        >
          <option value="">All Sub Categories</option>
          {categories
            .filter((c) => c.main_category === selectedMain)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="design-grid">
          {designs.map((d) => (
            <DesignCard key={d.id} design={d} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Designs;
