import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Paper,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stack,
  Fade,
  InputAdornment,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../utils/apiBase';
import { useDiscounts } from '../context/DiscountContext';

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { posterDiscounts, promoCodes } = useDiscounts();
  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    thana: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setForm((f) => ({ ...f, email: user?.email || '' }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, phone: digits });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const renderTick = (condition) => (
    <Fade in={condition} unmountOnExit>
      <InputAdornment position="end">
        <CheckCircleIcon sx={{ color: 'success.main' }} />
      </InputAdornment>
    </Fade>
  );

  const rawSubtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const itemDiscount = items.reduce((sum, item) => {
    const match = posterDiscounts.find(
      (d) => d.posterType === item.type && d.size === item.size
    );
    if (!match) return sum;
    const percent = match.percent ? ((item.price || 0) * match.percent) / 100 : 0;
    const amount = match.amount || 0;
    const perItem = percent > amount ? percent : amount;
    return sum + perItem * item.quantity;
  }, 0);
  const subtotal = rawSubtotal - itemDiscount;
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const promoDiscount = appliedPromo
    ? Math.max(
        subtotal * (appliedPromo.percent / 100),
        appliedPromo.amount
      )
    : 0;
  const normalizedCity = form.city.trim().toLowerCase();
  const deliveryCharge =
    normalizedCity === '' ? 0 : normalizedCity === 'dhaka' ? 70 : 120;
  const total = Number((subtotal + deliveryCharge - promoDiscount).toFixed(2));

  const handleApply = () => {
    const found = promoCodes.find(
      (p) => p.code.toLowerCase() === promoInput.trim().toLowerCase()
    );
    if (found) {
      setAppliedPromo(found);
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid code');
    }
  };

  const handleSubmit = async () => {
    const { name, phone, address, city, thana } = form;
    if (!name || phone.length !== 10 || !address || !city || !thana) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: `+880${form.phone}`,
          address: form.address,
          city: form.city,
          thana: form.thana,
          postal_code: form.postalCode,
          payment_method: 'cod',
          items,
          total_price: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      clearCart();
      navigate('/order-complete', {
        state: { orderId: data.order_id, items, form, total },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ endAdornment: renderTick(form.name.trim() !== '') }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  disabled={!!user}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="tel"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+880</InputAdornment>
                    ),
                    endAdornment: renderTick(form.phone.length === 10),
                  }}
                  inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ endAdornment: renderTick(form.address.trim() !== '') }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ endAdornment: renderTick(form.city.trim() !== '') }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Thana"
                  name="thana"
                  value={form.thana}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ endAdornment: renderTick(form.thana.trim() !== '') }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Postal Code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment
            </Typography>
            <RadioGroup value="cod">
              <FormControlLabel
                value="cod"
                control={<Radio />}
                label="Cash on Delivery"
              />
            </RadioGroup>
            <Button
              href="https://www.facebook.com/messages/t/105408722162260"
              target="_blank"
              rel="noopener"
              sx={{ mt: 2 }}
            >
              Want to prepay? Contact us for the process
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Stack spacing={1}>
              <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)} BDT</span>
              </Typography>
              <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span>
                <span>{deliveryCharge} BDT</span>
              </Typography>
              <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Promo Code:</span>
                <span>-{promoDiscount.toFixed(2)} BDT</span>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <TextField
                label="Promo Code"
                size="small"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <Button variant="outlined" onClick={handleApply}>
                Apply
              </Button>
            </Stack>
            {promoError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {promoError}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h6"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <span>Total:</span>
              <span>{total.toFixed(2)} BDT</span>
            </Typography>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
            >
              Place Order
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
