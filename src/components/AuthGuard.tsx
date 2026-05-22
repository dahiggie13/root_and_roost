'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const publicRoutes = ['/login', '/signup']

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      const isPublicRoute = publicRoutes.includes(pathname)

      if (!data.session && !isPublicRoute) {
        router.push('/login')
        return
      }

      if (data.session && isPublicRoute) {
        router.push('/')
        return
      }

      setCheckingAuth(false)
    }

    checkAuth()
  }, [pathname, router, supabase.auth])

  if (checkingAuth) {
    return <p className="p-4">Loading...</p>
  }

  return <>{children}</>
}