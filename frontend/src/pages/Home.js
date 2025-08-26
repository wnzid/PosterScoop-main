import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import DesignCard from '../components/DesignCard';
import API_BASE from '../utils/apiBase';

function Home() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/bestsellers`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setDesigns)
      .catch(() => setError('Failed to load designs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bestsellers">
      <h2>Bestsellers</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
          <div className="design-grid">
            {designs.map((d) => (
              <DesignCard key={d.id} design={d} />
            ))}
          </div>
        )}
      <Link to="/designs" className="see-more">See More</Link>
    </section>
  );
}

export default Home;
