import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { priceList } from '../utils/priceList';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotificationContext';
import { formatCurrency } from '../utils/currency';
import '../App.css';
import API_BASE from '../utils/apiBase';

function getThicknesses(type) {
  const entry = priceList[type];
  if (entry && !Array.isArray(entry)) return Object.keys(entry);
  return [];
}

function getSizes(type, thickness) {
  const entry = priceList[type];
  if (!entry) return [];
  if (Array.isArray(entry)) return entry;
  if (!thickness) return [];
  return entry[thickness] || [];
}

function getPrice(type, thickness, size) {
  const sizes = getSizes(type, thickness);
  const found = sizes.find((s) => s.size === size);
  return found ? found.price : 0;
}

function Customize() {
  const [posterType, setPosterType] = useState('');
  const [thickness, setThickness] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const { addItem } = useCart();
  const notify = useNotify();

  const thicknesses = getThicknesses(posterType);
  const sizes = getSizes(posterType, thickness);
  const price = getPrice(posterType, thickness, size) * qty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !posterType || !size || (thicknesses.length > 0 && !thickness)) {
      setError('All fields are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('poster_type', posterType);
      formData.append('size', size);
      const thickValue = thicknesses.length > 0 ? thickness : 'standard';
      formData.append('thickness', thickValue);
      formData.append('file', image);
      const res = await fetch(`${API_BASE}/api/custom-orders`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      addItem({ posterType, size, thickness: thickValue, price, qty, orderCode: data.order_code });
      setImage(null);
      setPreview(null);
      setPosterType('');
      setThickness('');
      setSize('');
      setQty(1);
      setError('');
      notify('Added to cart!');
    } catch {
      setError('Upload failed');
    }
  };

  return (
    <Box component="form" className="customize-form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center">
        Customize Your Poster
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Button
        variant="outlined"
        component="label"
        sx={{ alignSelf: 'center' }}
      >
        Upload Image
        <input
          type="file"
          accept="image/png, image/jpeg"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && !['image/png', 'image/jpeg'].includes(file.type)) {
              notify('Only JPG, JPEG, and PNG formats are allowed', 'error');
              e.target.value = '';
              setImage(null);
              setPreview(null);
              return;
            }
            setImage(file);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </Button>
      {preview && (
        <Box
          component="img"
          src={preview}
          alt="Preview"
          sx={{ width: '100%', borderRadius: 1 }}
        />
      )}
      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          value={posterType}
          label="Type"
          onChange={(e) => {
            setPosterType(e.target.value);
            setThickness('');
            setSize('');
          }}
        >
          <MenuItem value="">
            <em>Select Type</em>
          </MenuItem>
          {Object.keys(priceList).map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {thicknesses.length > 0 && (
        <FormControl fullWidth>
          <InputLabel>Thickness</InputLabel>
          <Select
            value={thickness}
            label="Thickness"
            onChange={(e) => {
              setThickness(e.target.value);
              setSize('');
            }}
          >
            <MenuItem value="">
              <em>Select Thickness</em>
            </MenuItem>
            {thicknesses.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControl fullWidth>
        <InputLabel>Size</InputLabel>
        <Select
          value={size}
          label="Size"
          onChange={(e) => setSize(e.target.value)}
        >
          <MenuItem value="">
            <em>Select Size</em>
          </MenuItem>
          {sizes.map((s) => (
            <MenuItem key={s.size} value={s.size}>
              {s.size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        type="number"
        label="Quantity"
        value={qty}
        inputProps={{ min: 1 }}
        onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
      />
      <Typography className="price" align="center">
        Price: {formatCurrency(price)}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowGuidelines((prev) => !prev)}
        sx={{ mt: 2 }}
      >
        Customize Design Guidelines
      </Button>
      <Collapse in={showGuidelines} sx={{ width: '100%', mt: 2 }} unmountOnExit>
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Guidelines for Custom Poster Uploads
          </Typography>
          <Typography gutterBottom>
            To ensure your custom poster looks crisp and professional, please
            follow these guidelines when uploading your image:
          </Typography>
          <Typography variant="subtitle1">1. Image Size and Resolution</Typography>
          <ul>
            <li>
              <Typography>Upload <strong>high-resolution images</strong> only.</Typography>
            </li>
            <li>
              <Typography>
                <strong>Recommended size</strong>: 2000 × 3000 pixels or larger.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Recommended resolution</strong>: 300 DPI (dots per inch)
                for print-quality results.
              </Typography>
            </li>
          </ul>
          <Typography variant="subtitle1">2. Accepted File Formats</Typography>
          <ul>
            <li>
              <Typography>JPG / JPEG</Typography>
            </li>
            <li>
              <Typography>PNG</Typography>
            </li>
            <li>
              <Typography variant="body2">
                Please do not upload PDF, Word, or ZIP files.
              </Typography>
            </li>
          </ul>
          <Typography variant="subtitle1">3. File Size Limit</Typography>
          <ul>
            <li>
              <Typography>
                <strong>Maximum file size</strong>: 50 MB
              </Typography>
            </li>
            <li>
              <Typography>
                (Larger images may take time to upload — please be patient.)
              </Typography>
            </li>
          </ul>
          <Typography variant="subtitle1">4. Image Quality Tips</Typography>
          <ul>
            <li>
              <Typography>
                Avoid screenshots or social media images — they are usually low
                quality.
              </Typography>
            </li>
            <li>
              <Typography>Do not use blurry or pixelated images.</Typography>
            </li>
            <li>
              <Typography>
                Make sure the image is not cropped or distorted.
              </Typography>
            </li>
          </ul>
          <Typography variant="subtitle1">5. Approval and Printing Notice</Typography>
          <ul>
            <li>
              <Typography>
                All custom designs are <strong>manually reviewed</strong> by our
                team.
              </Typography>
            </li>
            <li>
              <Typography>
                If your design is approved, we will proceed with printing and
                notify you.
              </Typography>
            </li>
            <li>
              <Typography>
                If not, you will be contacted via email to upload a
                better-quality image.
              </Typography>
            </li>
          </ul>
          <Typography variant="subtitle1">6. Design Ownership</Typography>
          <ul>
            <li>
              <Typography>
                Make sure you own the rights to the image you upload.
              </Typography>
            </li>
            <li>
              <Typography>
                We do not accept images with copyright violations.
              </Typography>
            </li>
          </ul>
          <Typography variant="subtitle1">7. Examples of Suitable Images</Typography>
          <ul>
            <li>
              <Typography>Original artwork or digital illustrations</Typography>
            </li>
            <li>
              <Typography>
                High-resolution photography (from camera or stock photo sites)
              </Typography>
            </li>
            <li>
              <Typography>
                Business or brand logos in PNG or high-quality JPG format
              </Typography>
            </li>
          </ul>
        </Box>
      </Collapse>
      <Button type="submit" variant="contained" color="secondary">
        Add to Cart
      </Button>
    </Box>
  );
}

export default Customize;
