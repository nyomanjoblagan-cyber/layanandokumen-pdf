import { ImageResponse } from 'next/og';

// Konfigurasi Gambar
export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generator Icon
export default function Icon() {
  return new ImageResponse(
    (
      // Element CSS-in-JS
      <div
        style={{
          fontSize: 20,
          background: 'linear-gradient(to bottom right, #dc2626, #991b1b)', // Gradasi Merah PDF
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px', // Kotak membulat (Rounded)
          fontWeight: 900,
          fontFamily: 'sans-serif',
          border: '2px solid white',
        }}
      >
        P
      </div>
    ),
    {
      ...size,
    }
  );
}