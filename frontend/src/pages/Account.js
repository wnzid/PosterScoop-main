import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../utils/apiBase';
import {
  Grid,
  Box,
  Button,
  Stack,
  Typography,
  Divider,
  TextField,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsIcon from '@mui/icons-material/Settings';

function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('details');
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' });
  const [profileMessage, setProfileMessage] = useState(null);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [pwdMessage, setPwdMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_BASE}/api/user?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setProfileForm({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      } catch {
        // ignore errors
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    const loadOrders = async () => {
      if (section !== 'orders' || !user) return;
      try {
        const res = await fetch(`${API_BASE}/api/orders?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch {
        // ignore errors
      }
    };
    loadOrders();
  }, [section, user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...profileForm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMessage({ type: 'error', text: data.error || 'Update failed' });
      } else {
        setProfileMessage({ type: 'success', text: 'Details updated' });
        const { message, ...rest } = data;
        setProfile((p) => ({ ...p, ...rest }));
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'Network error' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdMessage(null);
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: pwdForm.current, new_password: pwdForm.new }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdMessage({ type: 'error', text: data.error || 'Update failed' });
      } else {
        setPwdMessage({ type: 'success', text: 'Password updated' });
        setPwdForm({ current: '', new: '', confirm: '' });
      }
    } catch {
      setPwdMessage({ type: 'error', text: 'Network error' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderSection = () => {
    switch (section) {
      case 'details':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              My Details
            </Typography>
            {!profile ? (
              <CircularProgress />
            ) : (
              <Stack spacing={1}>
                <Typography>Name: {profile.name || '-'}</Typography>
                <Typography>Phone: {profile.phone || '-'}</Typography>
                <Typography>Address: {profile.address || '-'}</Typography>
                <Typography>Email: {profile.email}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Account created: {new Date(profile.created_at).toLocaleDateString()}
                </Typography>
              </Stack>
            )}
          </Paper>
        );
      case 'orders':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              My Orders
            </Typography>
            {orders.length === 0 ? (
              <Typography>You have no orders.</Typography>
            ) : (
              <Stack spacing={2}>
                {orders.map((o) => (
                  <Box key={o.id} sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Order #{o.order_code} - {new Date(o.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography>Status: {o.status}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={0.5}>
                      {o.items.map((item, idx) => (
                        <Typography key={idx} variant="body2">
                          {item.title} x {item.quantity}
                        </Typography>
                      ))}
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Typography>Total: {o.total_price}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        );
      case 'settings':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Account Settings
            </Typography>
            <Stack spacing={2} component="form" onSubmit={handleProfileUpdate} sx={{ mb: 4 }}>
              <TextField
                label="Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
              <TextField
                label="Phone Number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
              <TextField
                label="Address"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                multiline
              />
              <TextField label="Email" value={user.email} disabled />
              {profileMessage && <Alert severity={profileMessage.type}>{profileMessage.text}</Alert>}
              <Button type="submit" variant="contained">
                Save Details
              </Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Stack spacing={2} component="form" onSubmit={handlePasswordUpdate}>
              <TextField
                label="Current Password"
                type="password"
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                required
              />
              <TextField
                label="New Password"
                type="password"
                value={pwdForm.new}
                onChange={(e) => setPwdForm({ ...pwdForm, new: e.target.value })}
                required
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                required
              />
              {pwdMessage && <Alert severity={pwdMessage.type}>{pwdMessage.text}</Alert>}
              <Button type="submit" variant="contained">
                Update Password
              </Button>
            </Stack>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        {renderSection()}
      </Grid>
      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <Button
            variant={section === 'details' ? 'contained' : 'outlined'}
            startIcon={<PersonIcon />}
            onClick={() => setSection('details')}
          >
            My Details
          </Button>
          <Button
            variant={section === 'orders' ? 'contained' : 'outlined'}
            startIcon={<ShoppingBagIcon />}
            onClick={() => setSection('orders')}
          >
            My Orders
          </Button>
          <Button
            variant={section === 'settings' ? 'contained' : 'outlined'}
            startIcon={<SettingsIcon />}
            onClick={() => setSection('settings')}
          >
            Account Settings
          </Button>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Log Out
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default Account;
