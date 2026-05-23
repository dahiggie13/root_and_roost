'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const publicRoutes = ['/login', '/signup']
const supabase = createClient()

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        const isPublicRoute = publicRoutes.includes(pathname)

        if (!data.session && !isPublicRoute) {
          router.replace('/login')
          setCheckingAuth(false)
          return
        }

        if (data.session && isPublicRoute) {
          router.replace('/')
          setCheckingAuth(false)
          return
        }
      } catch (error) {
        console.log(error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (checkingAuth) {
    return <p className="p-4">Loading...</p>
  }

  return <>{children}</>
}
