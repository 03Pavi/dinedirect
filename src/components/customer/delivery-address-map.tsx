'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import SearchIcon from '@mui/icons-material/Search'
import PlaceIcon from '@mui/icons-material/Place'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import type LType from 'leaflet'
import { useDebounce } from '@/hooks/use-debounce'

import 'leaflet/dist/leaflet.css'

interface DeliveryAddressMapProps {
  value: string
  onChange: (address: string) => void
}

interface NominatimSearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

// Default fallback coordinates (Connaught Place / New Delhi, India)
const DEFAULT_LAT = 28.6139
const DEFAULT_LNG = 77.2090

export function DeliveryAddressMap({ value, onChange }: DeliveryAddressMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LType.Map | null>(null)
  const markerRef = useRef<LType.Marker | null>(null)

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  })
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [detectedAddress, setDetectedAddress] = useState<string>('')

  // Reverse Geocode using free OpenStreetMap Nominatim API
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setGeocodingLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en' },
        })
        const data = await res.json()
        if (data && data.display_name) {
          const formatted = data.display_name
          setDetectedAddress(formatted)
          // If the user's input is empty or matches previous detected address, update it
          onChange(formatted)
        }
      } catch (err) {
        console.error('Reverse geocode error:', err)
      } finally {
        setGeocodingLoading(false)
      }
    },
    [onChange]
  )

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return

      const L = (await import('leaflet')).default

      if (!isMounted || !mapContainerRef.current) return

      // Create Custom SVG Pulse Marker
      const pinIcon = L.divIcon({
        className: 'custom-delivery-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            transform: translate(-18px, -36px);
          ">
            <div class="delivery-pulse-ring" style="
              position: absolute;
              width: 38px;
              height: 38px;
              background: rgba(234, 88, 12, 0.3);
              border-radius: 50%;
            "></div>
            <div style="
              width: 32px;
              height: 32px;
              background: #ea580c;
              border: 2px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      // Create Map Instance with OpenStreetMap Tiles (Free Online API)
      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add Draggable Marker
      const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map)

      markerRef.current = marker
      mapInstanceRef.current = map

      // On Marker Drag End -> Reverse Geocode
      marker.on('dragend', () => {
        const position = marker.getLatLng()
        setCoords({ lat: position.lat, lng: position.lng })
        reverseGeocode(position.lat, position.lng)
      })

      // On Map Click -> Move Marker & Reverse Geocode
      map.on('click', (e: LType.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
        reverseGeocode(e.latlng.lat, e.latlng.lng)
      })

      // Auto-locate user on first load if geolocation is available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted) return
            const userLat = pos.coords.latitude
            const userLng = pos.coords.longitude
            setCoords({ lat: userLat, lng: userLng })
            map.setView([userLat, userLng], 16)
            marker.setLatLng([userLat, userLng])
            reverseGeocode(userLat, userLng)
          },
          () => {
            // User denied or error, perform reverse geocode on default coords
            reverseGeocode(DEFAULT_LAT, DEFAULT_LNG)
          },
          { timeout: 7000 }
        )
      } else {
        reverseGeocode(DEFAULT_LAT, DEFAULT_LNG)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [reverseGeocode])

  // GPS Locate Me Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        setCoords({ lat: userLat, lng: userLng })
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 17)
          markerRef.current.setLatLng([userLat, userLng])
        }
        reverseGeocode(userLat, userLng)
        setGpsLoading(false)
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Address Search Suggestions using free Nominatim API with 400ms debounce
  const debouncedAddressQuery = useDebounce(searchQuery, 400)

  useEffect(() => {
    const q = debouncedAddressQuery.trim()
    if (!q || q.length < 3) {
      setSearchResults([])
      setSearching(false)
      return
    }

    let isCurrent = true
    setSearching(true)

    async function search() {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&addressdetails=1&limit=5`
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en' },
        })
        const data: NominatimSearchResult[] = await res.json()
        if (isCurrent) {
          setSearchResults(data || [])
        }
      } catch (err) {
        console.error('Address search error:', err)
      } finally {
        if (isCurrent) setSearching(false)
      }
    }

    search()

    return () => {
      isCurrent = false
    }
  }, [debouncedAddressQuery])

  // Select Search Suggestion
  const handleSelectSuggestion = (result: NominatimSearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setCoords({ lat, lng })
    setSearchQuery('')
    setSearchResults([])
    setDetectedAddress(result.display_name)
    onChange(result.display_name)

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16)
      markerRef.current.setLatLng([lat, lng])
    }
  }

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <style>{`
        @keyframes deliveryPinPulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.9; }
        }
        .delivery-pulse-ring {
          animation: deliveryPinPulse 2s infinite ease-in-out;
        }
      `}</style>
      {/* Header with Title and "Locate Me" Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon sx={{ color: '#ea580c', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Delivery Location & Map
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={handleLocateMe}
          disabled={gpsLoading}
          startIcon={
            gpsLoading ? (
              <CircularProgress size={14} sx={{ color: '#ea580c' }} />
            ) : (
              <MyLocationIcon sx={{ fontSize: 16 }} />
            )
          }
          sx={{
            borderRadius: '10px',
            bgcolor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#ea580c',
            fontWeight: 700,
            fontSize: '0.78rem',
            px: 1.5,
            py: 0.4,
            textTransform: 'none',
            '&:hover': { bgcolor: '#fff7ed', borderColor: '#ea580c' },
          }}
        >
          {gpsLoading ? 'Detecting...' : 'Use Current Location'}
        </Button>
      </Box>

      {/* Online Search Input for Address */}
      <Box sx={{ position: 'relative', mb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search landmark, street, or locality..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {searching ? (
                  <CircularProgress size={16} sx={{ color: '#ea580c' }} />
                ) : (
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                )}
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '10px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.85rem',
            },
          }}
        />

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 1200,
              borderRadius: '12px',
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
            }}
          >
            {searchResults.map((item) => (
              <Box
                key={item.place_id}
                onClick={() => handleSelectSuggestion(item)}
                sx={{
                  p: 1.2,
                  px: 1.8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  borderBottom: '1px solid #f1f5f9',
                  '&:hover': { bgcolor: '#fff7ed' },
                }}
              >
                <PlaceIcon sx={{ color: '#ea580c', fontSize: 18, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#1e293b' }} noWrap>
                  {item.display_name}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* Leaflet OpenStreetMap Container */}
      <Box
        sx={{
          position: 'relative',
          height: 220,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1.5px solid #e2e8f0',
          mb: 1.5,
          bgcolor: '#e2e8f0',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Loading Overlay when Reverse Geocoding */}
        {geocodingLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              py: 0.5,
              px: 1.2,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              zIndex: 1000,
            }}
          >
            <CircularProgress size={14} sx={{ color: '#ea580c' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#ea580c' }}>
              Fetching address...
            </Typography>
          </Box>
        )}

        {/* Floating Pin Guidance Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            py: 0.4,
            px: 1.5,
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 600,
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          📍 Drag marker or click map to pinpoint doorstep
        </Box>
      </Box>

      {/* Complete Delivery Address & Landmark Field */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
          Delivery Address & Door / Flat Details:
        </Typography>
        <TextField
          fullWidth
          size="small"
          multiline
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Flat 302, Green Valley Apartments, Near City Park..."
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '10px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.85rem',
            },
          }}
        />
        {detectedAddress && (
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
            Pinpoint: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
