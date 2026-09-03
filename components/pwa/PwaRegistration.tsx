'use client'

import { useEffect } from 'react'

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => {
        // PWA tetap dapat digunakan sebagai situs biasa jika browser menolak service worker.
      })
  }, [])

  return null
}
