import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import '../App.css';
import API_BASE from '../utils/apiBase';

function AdminPerformance() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/product-performance`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  if (!user || !user.isAdmin) return <Navigate to="/login" replace />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product Performance
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Design Title</TableCell>
            <TableCell>Times Added</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.map((s) => (
            <TableRow key={s.design_id}>
              <TableCell>{s.title}</TableCell>
              <TableCell>{s.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default AdminPerformance;
