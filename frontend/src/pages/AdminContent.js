import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import '../App.css';
import API_BASE from '../utils/apiBase';

function AdminContent() {
  const { user } = useAuth();
  const { categories, designs, setDesigns } = useAdmin();
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  if (!user || !user.isAdmin) return <Navigate to="/login" replace />;

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const applyAction = async (action, ids = selected) => {
    const succeeded = [];
    for (const id of ids) {
      let res;
      try {
        if (action === 'delete') {
          res = await fetch(`${API_BASE}/api/designs/${id}`, { method: 'DELETE' });
        } else {
          const payload = {};
          if (action === 'feature') payload.featured = true;
          if (action === 'unfeature') payload.featured = false;
          if (action === 'hide') payload.hidden = true;
          if (action === 'unhide') payload.hidden = false;
          res = await fetch(`${API_BASE}/api/designs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
        if (res.ok) {
          succeeded.push(id);
        }
      } catch {
        // ignore network errors and treat as failure
      }
    }
    if (succeeded.length === 0) return;
    setDesigns((prev) =>
      prev
        .map((d) => {
          if (!succeeded.includes(d.id)) return d;
          if (action === 'delete') return null;
          if (action === 'feature') return { ...d, featured: true };
          if (action === 'unfeature') return { ...d, featured: false };
          if (action === 'hide') return { ...d, hidden: true };
          if (action === 'unhide') return { ...d, hidden: false };
          return d;
        })
        .filter(Boolean)
    );
    setSelected((prev) => prev.filter((id) => !succeeded.includes(id)));
  };

  const filteredDesigns = designs
    .filter((d) => (filter ? d.category === filter : true))
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const allSelectedFeatured =
    selected.length > 0 && selected.every((id) => designs.find((d) => d.id === id)?.featured);

  const allSelectedHidden =
    selected.length > 0 && selected.every((id) => designs.find((d) => d.id === id)?.hidden);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Content
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} displayEmpty size="small">
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          label="Search"
          size="small"
        />
      </Box>
      <Box className="actions" sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => applyAction(allSelectedFeatured ? 'unfeature' : 'feature')}
          disabled={selected.length === 0}
        >
          {allSelectedFeatured ? 'Unfeature' : 'Feature'}
        </Button>
        <Button
          variant="contained"
          onClick={() => applyAction(allSelectedHidden ? 'unhide' : 'hide')}
          disabled={selected.length === 0}
        >
          {allSelectedHidden ? 'Unhide' : 'Hide'}
        </Button>
        <Button variant="contained" onClick={() => applyAction('delete')} disabled={selected.length === 0}>
          Delete
        </Button>
        <Button variant="outlined" onClick={() => setSelected([])} disabled={selected.length === 0}>
          Clear Selection
        </Button>
      </Box>
      <div className="design-list">
        {filteredDesigns.map((d) => (
          <div key={d.id} className="design-item">
            <input
              type="checkbox"
              checked={selected.includes(d.id)}
              onChange={() => toggleSelect(d.id)}
            />
            <img src={d.imageUrl} alt={d.name} className="design-thumb" loading="lazy" />
            <span className="design-filename">
              {d.name} {d.featured && '(Featured)'} {d.hidden && '(Hidden)'}
            </span>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => applyAction(d.featured ? 'unfeature' : 'feature', [d.id])}
              >
                {d.featured ? 'Unfeature' : 'Feature'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => applyAction(d.hidden ? 'unhide' : 'hide', [d.id])}
              >
                {d.hidden ? 'Unhide' : 'Hide'}
              </Button>
              <Button size="small" variant="outlined" onClick={() => applyAction('delete', [d.id])}>
                Delete
              </Button>
            </Box>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default AdminContent;
