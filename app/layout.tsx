import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { PwaRegistration } from '@/components/pwa/PwaRegistration'

export const metadata: Metadata = {
  title: 'FinSight — Kelola Keuangan Pribadi',
  description: 'Aplikasi pencatatan keuangan pribadi dengan analisis AI',
  applicationName: 'FinSight',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'FinSight' },
  icons: {
    icon: [{ url: '/finsight-pwa-icon.png', type: 'image/png' }],
    apple: [{ url: '/finsight-pwa-icon.png', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <PwaRegistration />
      </body>
    </html>
  )
}
