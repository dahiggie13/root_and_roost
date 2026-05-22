'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Baby,
  Bell,
  Bird,
  Calendar,
  CloudSun,
  DollarSign,
  Egg,
  Home,
  House,
  LogIn,
  LogOut,
  Menu,
  ReceiptText,
  User,
  X,
  HeartPulse,
  Sprout,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export default function AppHeader() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [weather, setWeather] = useState<{
    temperature: number
    label: string
    location: string
  } | null>(null)

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      setEmail(data.session?.user.email || null)

      if (data.session?.user) {
        loadNotifications(data.session.user.id)
        loadWeather(data.session.user.id)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email || null)

      if (session?.user) {
        loadNotifications(session.user.id)
        loadWeather(session.user.id)
      } else {
        setNotifications([])
        setWeather(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  async function loadNotifications(userId: string) {
    const today = new Date()
    const sevenDaysFromNow = new Date()

    sevenDaysFromNow.setDate(today.getDate() + 7)

    const todayString = today.toISOString().split('T')[0]
    const sevenDaysString = sevenDaysFromNow.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('breeding_projects')
      .select('id, project_name, expected_hatch_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expected_hatch_date', todayString)
      .lte('expected_hatch_date', sevenDaysString)
      .order('expected_hatch_date', { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    setNotifications(data || [])
  }

  function getWeatherLabel(code: number) {
    if (code === 0) return 'Clear'
    if ([1, 2, 3].includes(code)) return 'Clouds'
    if ([45, 48].includes(code)) return 'Fog'
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
    if ([95, 96, 99].includes(code)) return 'Storm'
    return 'Weather'
  }

  async function loadWeather(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('weather_location')
      .eq('id', userId)
      .single()

    if (error || !profile?.weather_location) {
      setWeather(null)
      return
    }

    try {
      const searchParams = new URLSearchParams({
        name: profile.weather_location,
        count: '1',
        language: 'en',
        format: 'json',
      })

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${searchParams.toString()}`
      )
      const geoData = await geoResponse.json()
      const location = geoData.results?.[0]

      if (!location) {
        setWeather(null)
        return
      }

      const forecastParams = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        current: 'temperature_2m,weather_code',
        temperature_unit: 'fahrenheit',
      })

      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?${forecastParams.toString()}`
      )
      const forecastData = await forecastResponse.json()

      setWeather({
        temperature: Math.round(forecastData.current.temperature_2m),
        label: getWeatherLabel(forecastData.current.weather_code),
        location: location.name,
      })
    } catch (error) {
      console.log(error)
      setWeather(null)
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    setEmail(null)
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="text-[#fffaf0] shadow"
      style={{
        backgroundColor: '#2f4a2e',
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div className="flex items-center gap-3">
          {email && (
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open navigation menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          <Link href="/" onClick={() => setMenuOpen(false)}>
            <h1 className="brand-wordmark text-2xl font-semibold sm:text-3xl">
              Root & Roost
            </h1>
          </Link>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {email && weather && (
            <div
              className="flex max-w-24 items-center gap-1 truncate rounded-full px-2 py-1 text-xs font-medium sm:max-w-none sm:px-3 sm:text-sm"
              style={{
                backgroundColor: 'rgba(255, 250, 240, 0.14)',
              }}
              title={weather.location}
            >
              <CloudSun size={18} />
              <span>{weather.temperature}°</span>
              <span className="hidden sm:inline">{weather.label}</span>
            </div>
          )}

          {email && (
            <Link
              href="/calendar"
              title="Calendar"
              className="flex h-10 w-10 items-center justify-center rounded-full"
            >
              <Calendar size={24} />
            </Link>
          )}

          {email && (
            <div className="relative">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-full"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Open notifications"
              >
                <Bell size={24} />

                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 top-11 z-10 max-h-80 w-[calc(100vw-1.5rem)] max-w-72 overflow-y-auto rounded border p-3 text-[#2d2418] shadow"
                  style={{
                    backgroundColor: '#fffaf0',
                    borderColor: '#d8c8ac',
                  }}
                >
                  <h2 className="mb-2 font-bold">
                    Notifications
                  </h2>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      No upcoming hatch reminders.
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href="/breeding"
                          className="rounded border p-2 text-sm"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <p className="font-medium">
                            {notification.project_name}
                          </p>

                          <p className="text-gray-600">
                            Expected hatch: {notification.expected_hatch_date}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {email ? (
            <>
              <Link
                href="/account"
                title={email}
                className="flex h-10 w-10 items-center justify-center rounded-full"
              >
                <User size={24} />
              </Link>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full"
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              title="Log in"
              className="flex h-10 w-10 items-center justify-center rounded-full"
            >
              <LogIn size={24} />
            </Link>
          )}
        </div>
      </div>

      {email && menuOpen && (
        <nav
          className="border-t px-3 py-3 text-[#2d2418] sm:px-4"
          style={{
            backgroundColor: '#f4ead7',
            borderColor: '#526b43',
          }}
        >
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3">
            <NavItem href="/" label="Dashboard" icon={<Home size={20} />} onClick={() => setMenuOpen(false)} />
            <NavItem href="/animals" label="Animals" icon={<Bird size={20} />} onClick={() => setMenuOpen(false)} />
            <NavItem href="/breeding" label="Breeding" icon={<Egg size={20} />} onClick={() => setMenuOpen(false)} />
           <NavItem href="/health" label="Health" icon={<HeartPulse size={20} />} onClick={() => setMenuOpen(false)} />
            <NavItem href="/chicks" label="Young Stock" icon={<Baby size={20} />} onClick={() => setMenuOpen(false)} />
            <NavItem href="/garden" label="Garden" icon={<Sprout size={20} />} onClick={() => setMenuOpen(false)} />
            <NavItem href="/coops" label="Coops / Pastures" icon={<House size={20} />} onClick={() => setMenuOpen(false)} />
            <NavItem href="/sales" label="Sales" icon={<DollarSign size={20} />} onClick={() => setMenuOpen(false)} />
            <NavItem href="/expenses" label="Expenses" icon={<ReceiptText size={20} />} onClick={() => setMenuOpen(false)} />
         
          </div>
        </nav>
      )}
    </header>
  )
}

function NavItem({
  href,
  label,
  icon,
  onClick,
}: {
  href: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded border p-3 text-sm font-medium"
      style={{
        backgroundColor: '#fffaf0',
        borderColor: '#d8c8ac',
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
