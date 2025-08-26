import React from 'react';
import {
  Paper,
  Typography,
  Divider,
  Button,
  Link,
  Stack,
  Box,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { validateCart } from '../utils/validation';
import { useDiscounts } from '../context/DiscountContext';

const CartSummary = ({ cartItems = [] }) => {
  const { posterDiscounts } = useDiscounts();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  const itemDiscount = cartItems.reduce((sum, item) => {
    const match = posterDiscounts.find(
      (d) => d.posterType === item.type && d.size === item.size
    );
    if (!match) return sum;
    const percent = match.percent ? ((item.price || 0) * match.percent) / 100 : 0;
    const amount = match.amount || 0;
    const perItem = percent > amount ? percent : amount;
    return sum + perItem * item.quantity;
  }, 0);

  const discount = Number(itemDiscount.toFixed(2));
  const total = Number((subtotal - discount).toFixed(2));
  const { isValid, message } = validateCart(cartItems);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>

      <Stack spacing={1}>
        <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span> <span>{subtotal} BDT</span>
        </Typography>
        <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Discount:</span> <span>-{discount.toFixed(2)} BDT</span>
        </Typography>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="h6"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          Product Total Price:
        </Box>
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          {total.toFixed(2)} BDT
        </Box>
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
        <InfoOutlinedIcon fontSize="small" color="action" />
        <Typography variant="body2">
          Delivery charge will be added during checkout.
        </Typography>
      </Stack>

      {!isValid && (
        <Typography color="error" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}

      <Button
        component={RouterLink}
        to="/checkout"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={!isValid}
      >
        Proceed to Checkout
      </Button>

      <Link
        href="/"
        underline="hover"
        sx={{ display: 'block', textAlign: 'center', mt: 1 }}
      >
        ← Back to Shopping
      </Link>
    </Paper>
  );
};

export default CartSummary;
