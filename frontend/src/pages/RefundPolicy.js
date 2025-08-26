import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Fade } from '@mui/material';

function RefundPolicy() {
  const fadeProps = (delay = 0) => ({
    in: true,
    timeout: 700,
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <Fade {...fadeProps()}>
      <Box sx={{ py: 4, maxWidth: 800, mx: 'auto' }}>
        <Fade {...fadeProps()}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Posterscoop Refund Policy
          </Typography>
        </Fade>
      <Typography paragraph>
        At Posterscoop, we value your satisfaction. Our refund policy is designed to be fair, transparent, and easy to understand — ensuring peace of mind for our customers while maintaining a smooth business process.
      </Typography>
        <Fade {...fadeProps(200)}>
          <Typography variant="h5" gutterBottom>
            Eligibility for Refund
          </Typography>
        </Fade>
      <Typography paragraph>A refund will be issued if any of the following apply:</Typography>
      <List sx={{ listStyleType: 'decimal', pl: 4 }}>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText
            primary="Damaged or Defective Product"
            secondary={
              <>
                <Typography component="span" variant="body2" display="block">
                  If your order arrives damaged, torn, scratched, or misprinted, we’ll offer a full refund or replacement — no questions asked.
                </Typography>
                <Typography component="span" variant="body2" display="block">
                  You must inform us within <strong>24 hours</strong> of receiving the product and provide clear photos as proof.
                </Typography>
              </>
            }
          />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText
            primary="Wrong Product Received"
            secondary="If the poster size, type, or design does not match your order, we’ll refund or replace it immediately."
          />
        </ListItem>
      </List>
        <Fade {...fadeProps(400)}>
          <Typography variant="h5" gutterBottom>
            Non-Refundable Cases
          </Typography>
        </Fade>
      <List sx={{ listStyleType: 'disc', pl: 4 }}>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Change of Mind after order confirmation" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Custom Poster Orders (including uploads or personalization) unless damaged or incorrectly printed" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Failure to meet minimum order rules clearly displayed at checkout" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Incorrect delivery address provided by customer" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Refusal to accept delivery without valid reason" />
        </ListItem>
      </List>
        <Fade {...fadeProps(600)}>
          <Typography variant="h5" gutterBottom>
            Refund Method & Timeline
          </Typography>
        </Fade>
      <List sx={{ listStyleType: 'disc', pl: 4 }}>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Refunds are processed via bKash/Nagad/bank transfer within 5–7 business days of approval." />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="You’ll receive confirmation once the refund is initiated." />
        </ListItem>
      </List>
        <Fade {...fadeProps(800)}>
          <Typography variant="h5" gutterBottom>
            How to Request a Refund
          </Typography>
        </Fade>
      <List sx={{ listStyleType: 'decimal', pl: 4 }}>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText
            primary={
              <>
                Email us at <a href="mailto:posterscoop.official@gmail.com">posterscoop.official@gmail.com</a> or message us on our verified Facebook Page within 48 hours.
              </>
            }
          />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText
            primary="Include:"
            secondary={
              <List sx={{ listStyleType: 'disc', pl: 4 }}>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="Your Order ID" />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="A brief description of the issue" />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="Photo proof if applicable" />
                </ListItem>
              </List>
            }
          />
        </ListItem>
      </List>
      <Typography paragraph>
        Our team will respond within 24 hours with the next steps.
      </Typography>
        <Fade {...fadeProps(1000)}>
          <Typography variant="h5" gutterBottom>
            Fair Usage Policy
          </Typography>
        </Fade>
      <Typography paragraph>
        To prevent abuse of our policy, we reserve the right to limit refunds for customers who make excessive claims or repeatedly misuse the system.
      </Typography>
        <Fade {...fadeProps(1200)}>
          <Typography variant="h5" gutterBottom>
            Your Trust, Our Priority
          </Typography>
        </Fade>
      <Typography paragraph>
        We’re committed to ensuring your experience with Posterscoop is smooth and satisfying. This policy reflects our effort to build trust and long-term relationships with every customer across Bangladesh.
      </Typography>
      </Box>
    </Fade>
  );
}

export default RefundPolicy;
