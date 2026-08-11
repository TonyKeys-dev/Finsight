'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Navbar } from './Navbar'
import { Loader2 } from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState<string | undefined>()

  useEffect(() => {
    getSession().then((session) => {
      if (!session) { router.replace('/login'); return }
      setEmail(session.user.email ?? undefined)
      setReady(true)
    })
  }, [router])

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar email={email} />
      <main className="md:ml-60 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
