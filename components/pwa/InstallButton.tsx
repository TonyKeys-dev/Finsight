'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallButton({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setPromptEvent(null)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }

  if (!promptEvent) return null

  return (
    <button onClick={install} title="Install aplikasi" aria-label="Install aplikasi"
      className={compact
        ? 'w-9 h-9 flex items-center justify-center rounded-xl bg-yellow-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors'
        : 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-500 dark:text-zinc-400 hover:bg-yellow-100 dark:hover:bg-zinc-900 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors'}>
      <Download size={18} />
      {!compact && 'Install aplikasi'}
    </button>
  )
}
