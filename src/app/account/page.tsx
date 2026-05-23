'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function AccountPage() {
  const router = useRouter()

  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [username, setUsername] = useState('')
  const [homesteadName, setHomesteadName] = useState('')
  const [weatherLocation, setWeatherLocation] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadAccount() {
      try {
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
          router.push('/login')
          return
        }

        const user = data.session.user

        setUserId(user.id)
        setEmail(user.email || '')

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, homestead_name, weather_location, profile_image_url')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.log(error)
          alert(error.message)
          return
        }

        if (profile) {
          setUsername(profile.username || '')
          setHomesteadName(profile.homestead_name || '')
          setWeatherLocation(profile.weather_location || '')
          setProfileImageUrl(profile.profile_image_url || '')
        }
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [router])

  async function uploadProfileImage() {
    if (!profileImageFile || !userId) {
      return profileImageUrl
    }

    const fileExt = profileImageFile.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, profileImageFile)

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  async function handleSaveProfile() {
    if (!userId) return

    setSaving(true)

    try {
      const uploadedImageUrl = await uploadProfileImage()

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username,
          homestead_name: homesteadName,
          weather_location: weatherLocation,
          profile_image_url: uploadedImageUrl,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        throw profileError
      }

      setProfileImageUrl(uploadedImageUrl)
      setProfileImageFile(null)
      alert('Profile saved!')
    } catch (error: any) {
      console.log(error)
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateLogin() {
    setSaving(true)

    try {
      const updates: {
        email?: string
        password?: string
      } = {}

      if (email) {
        updates.email = email
      }

      if (newPassword) {
        updates.password = newPassword
      }

      const { error } = await supabase.auth.updateUser(updates)

      if (error) {
        throw error
      }

      setNewPassword('')
      alert('Login settings updated. Email changes may require confirmation.')
    } catch (error: any) {
      console.log(error)
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }
  
  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    router.push('/login')
  }

  if (loading) {
    return <p>Loading account...</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Account
      </h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Profile
        </h2>

        {profileImageUrl && (
          <img
            className="w-24 h-24 rounded-full object-cover mb-4 border"
            src={profileImageUrl}
            alt="Profile"
          />
        )}

        <input
          className="border p-2 w-full mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Homestead Name"
          value={homesteadName}
          onChange={(e) => setHomesteadName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Weather Location, like Denver, CO"
          value={weatherLocation}
          onChange={(e) => setWeatherLocation(e.target.value)}
        />

        <div className="mb-4">
          <label className="block font-medium mb-1">
            Profile Image
          </label>

          <input
            className="border p-2 w-full"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setProfileImageFile(e.target.files?.[0] || null)
            }
          />
        </div>

        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          Save Profile
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Login Settings
        </h2>

        <input
          className="border p-2 w-full mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleUpdateLogin}
          disabled={saving}
        >
          Update Login
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Session
        </h2>

        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>

      <Link href="/" className="text-blue-600 underline">
        Back to Dashboard
      </Link>
    </div>
  )
}
