import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';

const posterTypes = [
  {
    title: 'PVC Board Poster',
    description:
      'Rigid poster mounted on PVC board, perfect for long-lasting signage and displays.'
  },
  {
    title: 'PVC Poster',
    description:
      'Flexible PVC material with vibrant printing, great for everyday use.'
  },
  {
    title: 'Sticker Poster',
    description:
      'Adhesive poster that sticks to surfaces without frames, ideal for quick decoration.'
  }
];

export default function ProductInfo() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 5 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold', textAlign: 'center' }}
      >
        Product Info
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posterTypes.map((type) => (
          <Card key={type.title} sx={{ backgroundColor: '#f6f2ea' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {type.title}
              </Typography>
              <Typography>{type.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          href="https://drive.google.com/drive/folders/1Sqv9MBrR5jSKL6cArbjAwHW-4-e3iBdr?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Product Photos
        </Button>
      </Box>
    </Box>
  );
}

