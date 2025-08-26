import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqSections = [
  {
    title: 'Products & Customization',
    faqs: [
      {
        question: 'WHAT TYPES OF POSTERS DO YOU SELL?',
        answer:
          'We offer PVC Board Posters, PVC Posters, and Sticker Posters – each with various sizes and pricing.',
      },
      {
        question: 'CAN I CUSTOMIZE A POSTER WITH MY OWN IMAGE?',
        answer:
          'Yes. Upload one image, choose poster type and size on the Customize page, and we’ll handle the rest after reviewing your upload.',
      },
      {
        question: 'HOW DO I KNOW THE PRICE OF A POSTER?',
        answer:
          'Prices are fixed based on type and size. They are listed on each product card and apply to custom orders too.',
      },
    ],
  },
  {
    title: 'Ordering',
    faqs: [
      {
        question: 'WHAT ARE THE MINIMUM ORDER RULES?',
        answer:
          'Each size has a minimum quantity. If that isn’t met, the order must be at least 4 square feet per poster type.',
      },
      {
        question: 'DO I NEED TO CREATE AN ACCOUNT TO ORDER?',
        answer:
          'No, guest checkout is available. But signing up helps you track and manage your orders more easily.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    faqs: [
      {
        question: 'HOW LONG DOES DELIVERY TAKE?',
        answer: 'Dhaka: 2–3 working days. Outside Dhaka: 3–5 working days.',
      },
    ],
  },
  {
    title: 'Returns & Support',
    faqs: [
      {
        question: 'DO YOU OFFER REFUNDS OR EXCHANGES?',
        answer:
          'Yes, for damaged or incorrect items. Custom orders are only refundable if we make an error. See Refund Policy for full details.',
      },
      {
        question: 'HOW DO I CONTACT POSTERSCOOP?',
        answer:
          'Via Instagram, Facebook, or Email – all available at the bottom of the page. We usually reply within 24 hours.',
      },
    ],
  },
];

export default function FAQ() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 5 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold', textAlign: 'center' }}
      >
        FAQs
      </Typography>
      {faqSections.map((section, sIndex) => (
        <Box key={sIndex} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            {section.title}
          </Typography>
          {section.faqs.map((faq, qIndex) => (
            <Accordion key={qIndex} sx={{ backgroundColor: '#f6f2ea' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}
    </Box>
  );
}

