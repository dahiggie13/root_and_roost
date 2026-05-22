'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function SignupPage() {
  const supabase = createClient()
const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email to confirm your account!')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Sign Up</h1>

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
        onClick={handleSignup}
      >
        Create Account
      </button>
    </div>
  )
}
