import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { MAIN_CATEGORIES } from '../utils/categories';
import '../App.css';

function AdminCategories() {
  const { user } = useAuth();
  const { categories, createCategory, renameCategory, deleteCategory } = useAdmin();
  const [categoryName, setCategoryName] = useState('');
  const [mainCategory, setMainCategory] = useState(MAIN_CATEGORIES[0]);
  const [filter, setFilter] = useState('');

  if (!user || !user.isAdmin) return <Navigate to="/login" replace />;

  const handleCreate = (e) => {
    e.preventDefault();
    const name = categoryName.trim() || `Category#${String(categories.length + 1).padStart(3, '0')}`;
    createCategory(name, mainCategory);
    setCategoryName('');
  };

  const handleRename = (id, name) => {
    renameCategory(id, name);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this category?')) deleteCategory(id);
  };

  const filtered = categories
    .filter(
      (c) =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.main_category.toLowerCase().includes(filter.toLowerCase()),
    )
    .sort((a, b) =>
      a.main_category.localeCompare(b.main_category) || a.name.localeCompare(b.name),
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Categories
      </Typography>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Select
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
          size="small"
        >
          {MAIN_CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
        <TextField
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          label="Sub-category name"
          size="small"
        />
        <Button type="submit" variant="contained">
          Create
        </Button>
      </form>
      <TextField
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        label="Search"
        size="small"
        sx={{ mb: 2 }}
      />
      <List>
        {filtered.map((c) => (
          <ListItem
            key={c.id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(c.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <Typography sx={{ mr: 1 }}>{c.main_category}</Typography>
            <TextField
              value={c.name}
              onChange={(e) => handleRename(c.id, e.target.value)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default AdminCategories;
