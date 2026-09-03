import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinSight — Kelola Keuangan Pribadi',
    short_name: 'FinSight',
    description: 'Catat transaksi dan pantau keuangan pribadi dengan aman.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#eab308',
    icons: [
      { src: '/finsight-pwa-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
