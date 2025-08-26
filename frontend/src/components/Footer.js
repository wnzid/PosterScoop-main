import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.default',
        py: 3,
        mt: 'auto',
        boxShadow: '0 -1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Container>
        <Typography variant="body2" color="text.secondary" align="center">
          All rights reserved © 2025 PosterScoop
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <IconButton
            component="a"
            href="https://www.instagram.com/posterscoop/"
            target="_blank"
            rel="noopener"
            color="inherit"
            sx={{ mx: 0.5 }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.facebook.com/PosterScoop.new/"
            target="_blank"
            rel="noopener"
            color="inherit"
            sx={{ mx: 0.5 }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            component="a"
            href="mailto:posterscoop.official@gmail.com"
            color="inherit"
            sx={{ mx: 0.5 }}
          >
            <MailOutlineIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
