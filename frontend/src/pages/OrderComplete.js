import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  Button,
} from '@mui/material';

const OrderComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderIdParam = searchParams.get('orderId');
  const { orderId: stateOrderId, items, form, total } = location.state || {};
  const orderId = stateOrderId || orderIdParam;

  useEffect(() => {
    if (!location.state && !orderIdParam) {
      navigate('/');
    }
  }, [location.state, orderIdParam, navigate]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thank you for your purchase!
      </Typography>
      {orderId && (
        <Typography variant="h6" gutterBottom>
          Order #{orderId}
        </Typography>
      )}
      <Typography sx={{ mb: 2 }}>
        You will receive a confirmation within 24 hours.
      </Typography>
      {location.state ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography>{form?.name}</Typography>
              <Typography>{form?.address}</Typography>
              <Typography>
                {form?.city}, {form?.thana} {form?.postalCode}
              </Typography>
              <Typography>Email: {form?.email}</Typography>
              <Typography>Phone: +880{form?.phone}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              {items?.map((item, idx) => (
                <Typography key={idx}>
                  {item.title} x{item.quantity} - BDT {(item.price || 0) * item.quantity}
                </Typography>
              ))}
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight="bold">Total: BDT {total}</Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Typography sx={{ mt: 2 }}>
          We could not load your full order details.
        </Typography>
      )}
      <Button
        variant="contained"
        sx={{ mt: 4 }}
        component={Link}
        to="/"
      >
        Return Home
      </Button>
    </Container>
  );
};

export default OrderComplete;
