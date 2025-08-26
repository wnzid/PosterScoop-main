import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DesignCard from '../components/DesignCard';
import '../App.css';
import API_BASE from '../utils/apiBase';

function SearchResults() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get('q') || '';
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setError('No item found with that name');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/designs?search=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Search failed');
          });
        }
        return res.json();
      })
      .then((data) => {
        if (!data.length) {
          setError(`No item found with the name "${query}"`);
        } else {
          setDesigns(data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section className="designs-page">
      <h2>Search Results for "{query}"</h2>
      <div className="design-grid">
        {designs.map((d) => (
          <DesignCard key={d.id} design={d} />
        ))}
      </div>
    </section>
  );
}

export default SearchResults;
