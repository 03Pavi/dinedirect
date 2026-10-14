'use client'

import React, { useState, useEffect } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

export function CustomerBanner() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slides = [
    {
      badge: 'TOP RATED',
      title: 'Delicious Food, Best Meals for You',
      subtitle: 'Order mouthwatering dishes from top-rated restaurants with instant table service & fast delivery.',
      highlight: 'Freshly Prepared Daily',
      gradient: 'linear-gradient(135deg, #b91c1c 0%, #ea580c 45%, #65a30d 100%)',
      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    },
    {
      badge: 'AUTHENTIC TASTE',
      title: 'Authentic Indian & Global Flavors',
      subtitle: 'From piping hot Biryani to cheesy Woodfired Pizzas, crafted by passionate local kitchens.',
      highlight: 'Curated Kitchen Menus',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #ea580c 100%)',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    },
    {
      badge: 'DINE-IN & TAKEAWAY',
      title: 'Seamless Digital Ordering',
      subtitle: 'Scan table QR codes or place takeout orders with contactless convenience and live kitchen status.',
      highlight: 'Instant Live Updates',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #ea580c 100%)',
      img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    },
  ]

  // Auto-scroll effect: advances every 4 seconds, pauses on hover
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused, slides.length])

  const current = slides[activeSlide]

  return (
    <Box
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: current.gradient,
        color: '#ffffff',
        p: { xs: 3, sm: 4, md: 5 },
        position: 'relative',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: { xs: 200, sm: 220 },
        boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.25)',
        transition: 'background 0.6s ease-in-out, box-shadow 0.3s ease',
      }}
    >
      {/* Left text content */}
      <Box sx={{ zIndex: 1, maxWidth: { xs: '100%', md: '60%' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip
            icon={<LocalOfferIcon sx={{ fontSize: 16, color: '#ea580c !important' }} />}
            label={current.badge}
            size="small"
            sx={{
              bgcolor: '#ffffff',
              color: '#ea580c',
              fontWeight: 800,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>
            {current.highlight}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            lineHeight: 1.2,
            mb: 1,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem' },
            transition: 'opacity 0.3s ease',
          }}
        >
          {current.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            maxWidth: 460,
            mb: 2.5,
          }}
        >
          {current.subtitle}
        </Typography>

        {/* Carousel Dots */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {slides.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setActiveSlide(idx)}
              sx={{
                width: activeSlide === idx ? 28 : 8,
                height: 8,
                borderRadius: '4px',
                bgcolor: activeSlide === idx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#ffffff',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Right Graphic Food Image */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          width: 220,
          height: 180,
        }}
      >
        <Box
          component="img"
          key={current.img}
          src={current.img}
          alt="Featured meal"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0.4, transform: 'scale(0.97)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        />
      </Box>
    </Box>
  )
}
