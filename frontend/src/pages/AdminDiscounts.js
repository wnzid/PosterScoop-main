import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDiscounts } from '../context/DiscountContext';
import { priceList } from '../utils/priceList';

function getSizeOptions(type) {
  const entry = priceList[type];
  if (!entry) return [];
  if (Array.isArray(entry)) return entry.map((s) => s.size);
  const sizes = Object.values(entry).flat().map((s) => s.size);
  return Array.from(new Set(sizes));
}

function AdminDiscounts() {
  const {
    posterDiscounts,
    promoCodes,
    addPosterDiscount,
    removePosterDiscount,
    addPromoCode,
    removePromoCode,
  } = useDiscounts();

  const [poster, setPoster] = useState({
    posterType: '',
    sizes: [],
    percent: '',
    amount: '',
  });
  const [promo, setPromo] = useState({ code: '', percent: '', amount: '' });

  const handleAddPoster = async () => {
    if (!poster.posterType || poster.sizes.length === 0) return;
    const percent = parseFloat(poster.percent) || 0;
    const amount = parseFloat(poster.amount) || 0;
    for (const size of poster.sizes) {
      await addPosterDiscount({
        posterType: poster.posterType,
        size,
        percent,
        amount,
      });
    }
    setPoster({ posterType: '', sizes: [], percent: '', amount: '' });
  };

  const handleAddPromo = async () => {
    if (!promo.code) return;
    await addPromoCode({
      code: promo.code,
      percent: parseFloat(promo.percent) || 0,
      amount: parseFloat(promo.amount) || 0,
    });
    setPromo({ code: '', percent: '', amount: '' });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Discounts
      </Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Poster Discounts
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ my: 2 }}
      >
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="poster-type-label">Poster Type</InputLabel>
          <Select
            labelId="poster-type-label"
            value={poster.posterType}
            label="Poster Type"
            onChange={(e) =>
              setPoster({ ...poster, posterType: e.target.value, sizes: [] })
            }
          >
            {Object.keys(priceList).map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="size-label">Size</InputLabel>
          <Select
            labelId="size-label"
            multiple
            value={poster.sizes}
            label="Size"
            onChange={(e) =>
              setPoster({
                ...poster,
                sizes:
                  typeof e.target.value === 'string'
                    ? e.target.value.split(',')
                    : e.target.value,
              })
            }
            renderValue={(selected) => selected.join(', ')}
          >
            {getSizeOptions(poster.posterType).map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Percent"
          type="number"
          value={poster.percent}
          onChange={(e) => setPoster({ ...poster, percent: e.target.value })}
        />
        <TextField
          label="Amount (BDT)"
          type="number"
          value={poster.amount}
          onChange={(e) => setPoster({ ...poster, amount: e.target.value })}
        />
        <Button variant="contained" onClick={handleAddPoster}>
          Add
        </Button>
      </Stack>
      <List>
        {posterDiscounts.map((d) => (
          <ListItem
            key={d.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => removePosterDiscount(d.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${d.posterType} - ${d.size}`}
              secondary={`-${d.percent}% / -${d.amount} BDT`}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Promo Codes
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ my: 2 }}
      >
        <TextField
          label="Code"
          value={promo.code}
          onChange={(e) => setPromo({ ...promo, code: e.target.value })}
        />
        <TextField
          label="Percent"
          type="number"
          value={promo.percent}
          onChange={(e) => setPromo({ ...promo, percent: e.target.value })}
        />
        <TextField
          label="Amount (BDT)"
          type="number"
          value={promo.amount}
          onChange={(e) => setPromo({ ...promo, amount: e.target.value })}
        />
        <Button variant="contained" onClick={handleAddPromo}>
          Add
        </Button>
      </Stack>
      <List>
        {promoCodes.map((d) => (
          <ListItem
            key={d.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => removePromoCode(d.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={d.code}
              secondary={`-${d.percent}% / -${d.amount} BDT`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default AdminDiscounts;
