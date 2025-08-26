import React from 'react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' }
  })
};

const AboutUs = () => {
  const sections = [
    {
      title: 'About Us – Posterscoop',
      content:
        'Posterscoop started in 2022 with a simple frustration — overpriced posters with poor quality. One visit to a local poster shop made us realize how disconnected the pricing was from the actual value. The prints were blurry, and the image quality was ignored — yet the prices were sky-high.\n\nThat moment sparked an idea. Three of us — friends and now co-founders — decided to change the game. We built Posterscoop with one clear mission: Deliver the best-quality posters at the most affordable price in Bangladesh.'
    },
    {
      title: 'What Makes Posterscoop Different?',
      content:
        'While others ignore image clarity, we enhance every design 10x before printing, ensuring crisp, vibrant, and highly detailed posters.\n\nWe use premium materials, and every order is printed with precision — nothing leaves our studio unless it meets our standard.\n\nOur prices are fair, transparent, and honest — because everyone deserves access to good design.'
    },
    {
      title: 'Our Journey',
      content:
        'From just three of us doing everything — designing, printing, packaging, and delivering — Posterscoop has grown thanks to your support.\n\nNow, we’re a dedicated team working full-time to make sure your posters arrive on time and look amazing.\n\nWe’ve also upgraded our equipment: From one full-size printer, we now run two industrial machines, capable of printing posters up to 30 ft long and 5 ft wide.'
    },
    {
      title: 'Who Is Posterscoop For?',
      content:
        'Not everyone in Bangladesh values high-resolution printing — and that’s okay.\n\nWe’re here for the people who do.\n\nThe ones who care about aesthetics, clarity, and making their spaces feel like home. Whether it’s a bedroom wall, a cozy café corner, or a creative studio — Posterscoop brings walls to life.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 text-gray-900 py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-20">
        {sections.map((section, i) => (
          <motion.section
            key={i}
            className="space-y-4 bg-white/70 backdrop-blur rounded-xl shadow-lg p-6 md:p-10 hover:shadow-xl transition-shadow duration-300"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={i}
            variants={fadeIn}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              {section.title}
            </h2>
            {section.content.split('\n\n').map((para, j) => (
              <p key={j} className="text-lg leading-relaxed">
                {para}
              </p>
            ))}
          </motion.section>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;

