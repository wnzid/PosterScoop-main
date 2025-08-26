import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import '../App.css';

function AdminDashboard() {
  const { user } = useAuth();
  const { categories, designs } = useAdmin();
  const navigate = useNavigate();

  if (!user || !user.isAdmin) return <Navigate to="/login" replace />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        {categories.length} categories • {designs.length} designs
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => navigate('/admin/categories')}>
          Manage Categories
        </Button>
        <Button variant="contained" onClick={() => navigate('/admin/upload')}>
          Bulk Upload
        </Button>
        <Button variant="contained" onClick={() => navigate('/admin/content')}>
          Manage Content
        </Button>
        <Button variant="contained" onClick={() => navigate('/admin/discounts')}>
          Manage Discounts
        </Button>
        <Button variant="contained" onClick={() => navigate('/admin/orders')}>
          Orders
        </Button>
        <Button variant="contained" onClick={() => navigate('/admin/performance')}>
          Product Performance
        </Button>
      </Stack>
    </Container>
  );
}

export default AdminDashboard;
