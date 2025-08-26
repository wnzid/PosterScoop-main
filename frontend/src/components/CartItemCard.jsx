import React, { useEffect, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCart } from '../context/CartContext';
import getImageUrl from '../utils/getImageUrl';

function CartItemCard({ item, index }) {
  const { updateQuantity, removeItem } = useCart();
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    if (!item.image) return;
    let mounted = true;
    getImageUrl(item.image)
      .then((url) => {
        if (mounted) setImgUrl(url);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [item.image]);

  const increaseQty = () => updateQuantity(index, item.quantity + 1);
  const decreaseQty = () => {
    if (item.quantity > 1) {
      updateQuantity(index, item.quantity - 1);
    }
  };

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      {!item.orderCode && imgUrl && (
        <CardMedia
          component="img"
          image={imgUrl}
          alt={item.title}
          sx={{ width: 64, height: 64, objectFit: 'contain', mr: 2 }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {item.title || 'Design'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.type} – {item.size} {item.thickness && `– ${item.thickness}`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Typography sx={{ mr: 1 }}>Qty:</Typography>
          <IconButton
            onClick={decreaseQty}
            disabled={item.quantity <= 1}
            size="small"
          >
            <RemoveCircleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
          <IconButton onClick={increaseQty} size="small">
            <AddCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
      <Box sx={{ textAlign: 'right', pr: 1 }}>
        <Typography variant="body2">Unit Price: BDT {item.price}</Typography>
        <Typography fontWeight="bold">
          Total: BDT {item.price * item.quantity}
        </Typography>
        <Button
          color="error"
          size="small"
          startIcon={<DeleteOutlineIcon fontSize="small" />}
          onClick={() => removeItem(index)}
          sx={{ mt: 1 }}
        >
          Remove
        </Button>
      </Box>
    </Card>
  );
}

export default CartItemCard;

