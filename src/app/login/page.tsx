'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Login</h1>

      <input
        className="border p-2 block mb-4"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 block mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  )
}
