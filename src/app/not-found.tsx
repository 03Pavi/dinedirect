import Link from 'next/link'
import { Box, Container, Typography, Button } from '@mui/material'

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h2" sx={{ fontWeight: 800, color: '#E85D04', mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1D2A44' }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: '#6C757D', mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button variant="contained" color="primary" component={Link} href="/">
          Back to Home
        </Button>
      </Container>
    </Box>
  )
}
