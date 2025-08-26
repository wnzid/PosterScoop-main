import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import CartItemCard from './CartItemCard';
import CartSummary from './CartSummary';

const CartPage = ({ cartItems = [] }) => {
  const safeItems = Array.isArray(cartItems) ? cartItems : [];

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {safeItems.length === 0 ? (
            <Typography align="center" color="text.secondary">
              Your cart is empty.
            </Typography>
          ) : (
            safeItems.map((item, index) => (
              <CartItemCard key={item.id || index} item={item} index={index} />
            ))
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <CartSummary cartItems={safeItems} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
