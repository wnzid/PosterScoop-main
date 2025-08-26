import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Collapse,
  Box,
  Select,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../utils/apiBase';
import getImageUrl from '../utils/getImageUrl';

function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState({});
  const statuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders`);
        if (res.ok) {
          const data = await res.json();
          for (const order of data) {
            order.items = await Promise.all(
              order.items.map(async (item) => {
                if (item.image) {
                  try {
                    const url = await getImageUrl(item.image);
                    return { ...item, image: url };
                  } catch {
                    return item;
                  }
                }
                return item;
              })
            );
          }
          setOrders(data);
        }
      } catch {
        // ignore fetch errors
      }
    };
    load();
  }, []);

  const toggle = (id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } catch {
      // ignore
    }
  };

  const downloadCustom = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/api/custom-orders/${code}/download`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = res.headers.get('Content-Disposition');
      let filename = code;
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/i);
        if (match && match[1]) filename = match[1];
      }
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const deleteCustom = async (orderId, code) => {
    try {
      const res = await fetch(`${API_BASE}/api/custom-orders/${code}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.map((item) =>
                    item.orderCode === code ? { ...item, orderCode: undefined } : item
                  ),
                }
              : o
          )
        );
      }
    } catch {
      // ignore
    }
  };

  if (!user || !user.isAdmin) return <Navigate to="/login" replace />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => {
              const subtotal = o.items.reduce(
                (sum, item) => sum + (item.price || 0) * item.quantity,
                0
              );
              const deliveryCharge = (o.total_price || 0) - subtotal;
              const hasCustom = o.items.some((item) => item.orderCode);
              return (
              <React.Fragment key={o.id}>
                <TableRow>
                  <TableCell>#{o.order_code}</TableCell>
                  <TableCell>
                    <div>{o.name}</div>
                    <div>{o.email}</div>
                    <div>{o.phone}</div>
                  </TableCell>
                  <TableCell>{o.total_price}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => toggle(o.id)}>
                      {open[o.id] ? 'Hide' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} sx={{ p: 0 }}>
                    <Collapse in={open[o.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ m: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Items
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Design</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Size</TableCell>
                              <TableCell>Thickness</TableCell>
                              <TableCell>Qty</TableCell>
                              {hasCustom && <TableCell>Custom</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {o.items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      width={40}
                                      style={{ marginRight: 8 }}
                                    />
                                  )}
                                  {item.title}
                                </TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>{item.size}</TableCell>
                                <TableCell>{item.thickness}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                {hasCustom && (
                                  <TableCell>
                                    {item.orderCode && (
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2">{item.orderCode}</Typography>
                                        <Button size="small" onClick={() => downloadCustom(item.orderCode)}>
                                          Download
                                        </Button>
                                        <Button
                                          size="small"
                                          color="error"
                                          onClick={() => deleteCustom(o.id, item.orderCode)}
                                        >
                                          Delete
                                        </Button>
                                      </Stack>
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1">Price Summary</Typography>
                          <Stack spacing={1}>
                            <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Subtotal:</span>
                              <span>{subtotal} BDT</span>
                            </Typography>
                            <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Delivery:</span>
                              <span>{deliveryCharge} BDT</span>
                            </Typography>
                          </Stack>
                          <Divider sx={{ my: 1 }} />
                          <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total:</span>
                            <span>{o.total_price} BDT</span>
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1">Delivery</Typography>
                          <div>{o.address}</div>
                          <div>
                            {o.city} {o.postal_code}
                          </div>
                          <div>{o.phone}</div>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1">Status</Typography>
                          <Select
                            size="small"
                            value={o.status}
                            onChange={(e) => updateStatus(o.id, e.target.value)}
                          >
                            {statuses.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default AdminOrders;
