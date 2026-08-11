'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, BarChart2, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { signOut } from '@/lib/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/rekap', label: 'Rekap', icon: BarChart2 },
]

export function Navbar({ email }: { email?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-white dark:bg-black border-r border-yellow-200 dark:border-zinc-800 z-40 p-5 gap-2">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-yellow-500 dark:text-yellow-400">FinSight</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{email}</p>
        </div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors',
              pathname === href
                ? 'bg-yellow-400 text-black font-bold shadow-sm dark:bg-yellow-400 dark:text-black'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-yellow-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-yellow-400'
            )}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-yellow-100 dark:border-zinc-800">
          <ThemeToggle />
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors">
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-black border-b border-yellow-200 dark:border-zinc-800 z-40 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-black text-yellow-500 dark:text-yellow-400">FinSight</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-xl bg-yellow-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-yellow-200 dark:border-zinc-800 z-40 flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              pathname === href
                ? 'text-yellow-600 dark:text-yellow-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400'
            )}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}