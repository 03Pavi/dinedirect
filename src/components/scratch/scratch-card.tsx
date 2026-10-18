'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Box, Typography, Button, Stack, Chip, Alert, IconButton } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import SparklesIcon from '@mui/icons-material/AutoAwesome'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CelebrationIcon from '@mui/icons-material/Celebration'

interface ScratchCardProps {
  couponCode: string
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number
  description?: string
  minOrderAmount?: number
  restaurantName?: string
  restaurantId?: string
  onRevealed?: () => void
  onOrderNow?: () => void
}

export function ScratchCard({
  couponCode,
  discountType,
  discountValue,
  description,
  minOrderAmount = 0,
  restaurantName = 'DineDirect Kitchen',
  restaurantId,
  onRevealed,
  onOrderNow,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [isScratched, setIsScratched] = useState(false)
  const [scratchPercent, setScratchPercent] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Initialize canvas with luxurious gold/silver metallic foil texture
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const width = Math.max(280, Math.floor(rect.width))
    const height = Math.max(340, Math.floor(rect.height))

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Metallic gradient (warm gold with shimmer)
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#fef08a')
    gradient.addColorStop(0.2, '#eab308')
    gradient.addColorStop(0.4, '#ca8a04')
    gradient.addColorStop(0.6, '#fef08a')
    gradient.addColorStop(0.8, '#eab308')
    gradient.addColorStop(1, '#a16207')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw subtle sparkling speckles for authentic scratch foil look
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    for (let i = 0; i < 90; i++) {
      const rx = (i * 37) % width
      const ry = (i * 59) % height
      const size = (i % 3) + 1.2
      ctx.beginPath()
      ctx.arc(rx, ry, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Border inner frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 4
    ctx.strokeRect(12, 12, width - 24, height - 24)

    // Scratch Icon & Call to Action text
    ctx.fillStyle = '#78350f'
    ctx.font = 'bold 26px "Inter", "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎁', width / 2, height / 2 - 45)

    ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif'
    ctx.fillText('SCRATCH & WIN', width / 2, height / 2 - 10)

    ctx.font = '600 13px "Inter", "Segoe UI", sans-serif'
    ctx.fillStyle = '#854d0e'
    ctx.fillText('✨ Rub here with your finger ✨', width / 2, height / 2 + 18)

    ctx.font = '500 11px "Inter", "Segoe UI", sans-serif'
    ctx.fillStyle = '#a16207'
    ctx.fillText('Reveal secret coupon code', width / 2, height / 2 + 38)
  }, [])

  useEffect(() => {
    initCanvas()
    const handleResize = () => {
      if (!isScratched) {
        initCanvas()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initCanvas, isScratched])

  // Scratch action drawing
  const scratch = (clientX: number, clientY: number) => {
    if (isScratched) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 28, 0, Math.PI * 2)
    ctx.fill()

    // Calculate cleared percentage roughly
    checkProgress()
  }

  // Check how much of the foil has been removed
  const checkProgress = () => {
    const canvas = canvasRef.current
    if (!canvas || isScratched) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const { width, height } = canvas
      // Sample pixels with a step of 10 for high performance
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      let transparentCount = 0
      const totalSamples = (width * height) / 100

      for (let i = 3; i < data.length; i += 400) {
        if (data[i] === 0) {
          transparentCount++
        }
      }

      const percent = Math.min(100, Math.round((transparentCount / (totalSamples / 4)) * 100))
      setScratchPercent(percent)

      // When over 35% scratched, fully reveal
      if (percent >= 35) {
        triggerReveal()
      }
    } catch {
      // ignore security context errors if any
    }
  }

  const triggerReveal = () => {
    if (isScratched) return
    setIsScratched(true)
    setScratchPercent(100)
    setShowConfetti(true)
    if (onRevealed) onRevealed()

    // Save coupon to localStorage for automatic pickup at cart/checkout
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dine_applied_coupon', couponCode)
        localStorage.setItem('dine_scratched_coupon', JSON.stringify({
          code: couponCode,
          discountType,
          discountValue,
          restaurantId,
          restaurantName,
        }))
      }
    } catch (e) {
      console.warn('Storage save error:', e)
    }

    setTimeout(() => {
      setShowConfetti(false)
    }, 4500)
  }

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    scratch(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    scratch(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  // Touch Handlers for Mobile Phones
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)
  }

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(couponCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const discountFormatted =
    discountType === 'PERCENTAGE' ? `${discountValue}% OFF` : `₹${discountValue} OFF`

  return (
    <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto', position: 'relative' }}>
      {/* Confetti Animation Layer */}
      {showConfetti && (
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            left: -50,
            right: -50,
            bottom: -50,
            pointerEvents: 'none',
            zIndex: 999,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 40 }).map((_, idx) => {
            const colors = ['#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
            const color = colors[idx % colors.length]
            const left = `${(idx * 7) % 100}%`
            const delay = `${(idx % 10) * 0.12}s`
            const duration = `${1.5 + (idx % 5) * 0.3}s`

            return (
              <Box
                key={idx}
                sx={{
                  position: 'absolute',
                  top: '-10px',
                  left,
                  width: idx % 2 === 0 ? '10px' : '6px',
                  height: idx % 2 === 0 ? '14px' : '6px',
                  borderRadius: idx % 3 === 0 ? '50%' : '2px',
                  bgcolor: color,
                  animation: `fallConfetti ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                  animationDelay: delay,
                  '@keyframes fallConfetti': {
                    '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                    '100%': { transform: 'translateY(450px) rotate(720deg)', opacity: 0 },
                  },
                }}
              />
            )
          })}
        </Box>
      )}

      {/* Main Card Container */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 350,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: isScratched
            ? '0 20px 40px -15px rgba(234,88,12,0.35), 0 0 0 2px #ea580c'
            : '0 15px 35px -10px rgba(0,0,0,0.15), 0 0 0 1px #e2e8f0',
          transition: 'all 0.4s ease',
          bgcolor: '#ffffff',
          userSelect: 'none',
        }}
      >
        {/* UNDERNEATH: Revealed Prize & Coupon Card */}
        <Box
          sx={{
            p: 3,
            minHeight: 350,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'radial-gradient(circle at 50% 20%, #fff7ed 0%, #ffffff 80%)',
          }}
        >
          {/* Festive Badge */}
          <Chip
            icon={<CelebrationIcon sx={{ fontSize: '18px !important', color: '#ea580c' }} />}
            label="YOU WON A SPECIAL DEAL!"
            size="small"
            sx={{
              bgcolor: '#ffedd5',
              color: '#c2410c',
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              mb: 1.5,
              py: 0.5,
              border: '1px solid #fed7aa',
            }}
          />

          {/* Discount Value */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#ea580c',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              mb: 0.5,
            }}
          >
            {discountFormatted}
          </Typography>

          {/* Offer Description */}
          <Typography
            variant="body2"
            sx={{
              color: '#475569',
              fontWeight: 600,
              maxWidth: 260,
              mb: 2,
              lineHeight: 1.35,
            }}
          >
            {description || `Enjoy ${discountFormatted} on your delicious dining order!`}
          </Typography>

          {/* Coupon Code Reveal Box */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 280,
              bgcolor: '#f8fafc',
              border: '2px dashed #ea580c',
              borderRadius: '12px',
              p: 1.5,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ textAlign: 'left', pl: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                Coupon Code
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                {couponCode}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={handleCopy}
              startIcon={copied ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: copied ? '#16a34a' : '#ea580c',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'none',
                borderRadius: '8px',
                px: 1.5,
                py: 0.7,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: copied ? '#15803d' : '#c2410c',
                },
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Box>

          {/* Minimum order note */}
          {minOrderAmount > 0 && (
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 2 }}>
              * Applicable on orders above ₹{minOrderAmount}
            </Typography>
          )}

          {/* Order Action Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={onOrderNow}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#0f172a',
              color: '#ffffff',
              fontWeight: 800,
              py: 1.2,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
              '&:hover': {
                bgcolor: '#ea580c',
              },
            }}
          >
            Order Now & Use Code
          </Button>
        </Box>

        {/* OVERLAY: Metallic Scratch Foil Canvas */}
        <Box
          component="canvas"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            cursor: isScratched ? 'default' : 'grab',
            transition: 'opacity 0.5s ease',
            opacity: isScratched ? 0 : 1,
            pointerEvents: isScratched ? 'none' : 'auto',
            touchAction: 'none', // Prevents screen scrolling while scratching on mobile
          }}
        />
      </Box>

      {/* Progress & Quick Reveal Controls */}
      {!isScratched && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1.8, px: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <SparklesIcon sx={{ fontSize: 16, color: '#eab308' }} />
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              {scratchPercent > 0 ? `${scratchPercent}% scratched` : 'Swipe to scratch'}
            </Typography>
          </Box>

          <Button
            size="small"
            variant="text"
            onClick={triggerReveal}
            sx={{
              color: '#ea580c',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              p: 0,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Instant Reveal
          </Button>
        </Stack>
      )}
    </Box>
  )
}
