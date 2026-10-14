import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
          borderRadius: 8,
          fontSize: 18,
        }}
      >
        🍴
      </div>
    ),
    { ...size }
  )
}
