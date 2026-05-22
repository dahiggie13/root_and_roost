'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Baby,
  Bird,
  CloudSun,
  DollarSign,
  Egg,
  HeartPulse,
  Home,
  Plus,
  ReceiptText,
  Sprout,
  X,
  Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

type RecentActivity = {
  id: string
  type: string
  title: string
  subtitle: string
  date: string
  href: string
}

export default function DashboardPage() {
  const router = useRouter()
const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [totalAnimals, setTotalAnimals] = useState(0)
  const [poultry, setPoultry] = useState(0)
  const [goats, setGoats] = useState(0)
  const [sheep, setSheep] = useState(0)
  const [cattle, setCattle] = useState(0)
  const [pigs, setPigs] = useState(0)
  const [horses, setHorses] = useState(0)
  const [bees, setBees] = useState(0)
  const [otherAnimals, setOtherAnimals] = useState(0)
  const [activeBreedings, setActiveBreedings] = useState(0)
  const [activeYoungStock, setActiveYoungStock] = useState(0)
  const [hatchReminders, setHatchReminders] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [gardenBeds, setGardenBeds] = useState(0)
  const [activeCrops, setActiveCrops] = useState(0)
  const [upcomingHarvests, setUpcomingHarvests] = useState(0)
  const [healthRecords, setHealthRecords] = useState(0)
  const [healthCosts, setHealthCosts] = useState(0)
  const [weather, setWeather] = useState<{
    temperature: number
    label: string
    location: string
  } | null>(null)
  const [weatherMessage, setWeatherMessage] = useState('Loading weather...')

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const userId = userData.user.id
      const today = new Date()
      const sevenDaysFromNow = new Date()

      sevenDaysFromNow.setDate(today.getDate() + 7)

      const todayString = today.toISOString().split('T')[0]
      const sevenDaysString = sevenDaysFromNow.toISOString().split('T')[0]

const { data: recentAnimals } = await supabase
  .from('animals')
  .select('id, name, animal_type, animal_subtype, band_number, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(5)

const { data: recentSales } = await supabase
  .from('sales')
  .select('id, item_name, price, sale_date, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(5)

const { data: recentExpenses } = await supabase
  .from('expenses')
  .select('id, expense_name, amount, expense_date, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(5)

const activityItems: RecentActivity[] = [
  ...(recentAnimals || []).map((animal) => ({
    id: `animal-${animal.id}`,
    type: 'Animal',
    title: animal.name || animal.band_number || 'Unnamed animal',
    subtitle: animal.animal_type === 'poultry'
      ? `Poultry${animal.animal_subtype ? ` - ${animal.animal_subtype}` : ''}`
      : animal.animal_type || 'Animal added',
    date: animal.created_at,
    href: `/animals/${animal.id}`,
  })),

  ...(recentSales || []).map((sale) => ({
    id: `sale-${sale.id}`,
    type: 'Sale',
    title: sale.item_name || 'Sale recorded',
    subtitle: `$${Number(sale.price || 0).toFixed(2)}`,
    date: sale.created_at || sale.sale_date,
    href: '/sales',
  })),

  ...(recentExpenses || []).map((expense) => ({
    id: `expense-${expense.id}`,
    type: 'Expense',
    title: expense.expense_name || 'Expense recorded',
    subtitle: `$${Number(expense.amount || 0).toFixed(2)}`,
    date: expense.created_at || expense.expense_date,
    href: '/expenses',
  })),
]
  .filter((item) => item.date)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 6)

setRecentActivities(activityItems)

      const { count: animalCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: poultryCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'poultry')

      const { count: goatCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'goat')

      const { count: sheepCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'sheep')

      const { count: cattleCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'cattle')

      const { count: pigCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'pig')

      const { count: horseCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'horse')

      const { count: beeCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'bee')

      const { count: otherAnimalCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('animal_type', 'other')

      const { count: breedingCount } = await supabase
        .from('breeding_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')

      const { count: youngStockCount } = await supabase
        .from('chicks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .or('promoted_to_animal.is.null,promoted_to_animal.eq.false')

      const { count: hatchCount } = await supabase
        .from('breeding_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('expected_hatch_date', todayString)
        .lte('expected_hatch_date', sevenDaysString)

      const { data: salesData } = await supabase
        .from('sales')
        .select('price')
        .eq('user_id', userId)

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)

      const { count: gardenBedCount } = await supabase
        .from('garden_beds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: activeCropCount } = await supabase
        .from('crops')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['planned', 'planted', 'growing'])

      const { count: harvestCount } = await supabase
        .from('crops')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('expected_harvest_date', todayString)
        .lte('expected_harvest_date', sevenDaysString)

      const { count: healthRecordCount } = await supabase
        .from('health_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { data: healthData } = await supabase
        .from('health_records')
        .select('cost')
        .eq('user_id', userId)

      const { data: profile } = await supabase
        .from('profiles')
        .select('weather_location')
        .eq('id', userId)
        .single()

      if (profile?.weather_location) {
        try {
          setWeatherMessage(`Looking up ${profile.weather_location}...`)
          const locationName = profile.weather_location.split(',')[0].trim()

          const geoParams = new URLSearchParams({
            name: locationName,
            count: '1',
            language: 'en',
            format: 'json',
          })

          const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?${geoParams.toString()}`
          )
          const geoData = await geoResponse.json()
          const location = geoData.results?.[0]

          if (location) {
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
            setWeatherMessage('')
          } else {
            setWeather(null)
            setWeatherMessage(`Could not find weather for ${profile.weather_location}. Try City, State.`)
          }
        } catch (error) {
          console.log(error)
          setWeather(null)
          setWeatherMessage('Weather lookup failed. Try refreshing or changing the location.')
        }
      } else {
        setWeather(null)
        setWeatherMessage('Add a weather location in Account settings.')
      }

      const salesTotal = salesData?.reduce((sum, sale) => {
        return sum + Number(sale.price || 0)
      }, 0) || 0

      const expenseTotal = expensesData?.reduce((sum, expense) => {
        return sum + Number(expense.amount || 0)
      }, 0) || 0

      const healthTotal = healthData?.reduce((sum, record) => {
        return sum + Number(record.cost || 0)
      }, 0) || 0

      setTotalAnimals(animalCount || 0)
      setPoultry(poultryCount || 0)
      setGoats(goatCount || 0)
      setSheep(sheepCount || 0)
      setCattle(cattleCount || 0)
      setPigs(pigCount || 0)
      setHorses(horseCount || 0)
      setBees(beeCount || 0)
      setOtherAnimals(otherAnimalCount || 0)
      setActiveBreedings(breedingCount || 0)
      setActiveYoungStock(youngStockCount || 0)
      setHatchReminders(hatchCount || 0)
      setTotalSales(salesTotal)
      setTotalExpenses(expenseTotal)
      setGardenBeds(gardenBedCount || 0)
      setActiveCrops(activeCropCount || 0)
      setUpcomingHarvests(harvestCount || 0)
      setHealthRecords(healthRecordCount || 0)
      setHealthCosts(healthTotal)
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return <p>Loading dashboard...</p>
  }

  return (
    <div>
      <div className="relative mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Dashboard
        </h1>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full shadow"
          style={{
            backgroundColor: '#2f4a2e',
            border: '2px solid #fffaf0',
            color: '#fffaf0',
            boxShadow: '0 6px 16px rgba(45, 36, 24, 0.22)',
          }}
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          aria-label="Quick actions"
        >
          {quickActionsOpen ? <X size={24} /> : <Plus size={24} />}
        </button>

        {quickActionsOpen && (
          <div className="absolute right-0 top-14 z-20 w-[calc(100vw-1.5rem)] max-w-56 rounded-xl border bg-white p-3 shadow">
            <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            <QuickActionLink href="/animals" label="Add Animal" />
            <QuickActionLink href="/chicks" label="Add Young Stock" />
            <QuickActionLink href="/sales" label="Add Sale" />
            <QuickActionLink href="/expenses" label="Add Expense" />
            <QuickActionLink href="/calendar" label="Add Calendar Event" />
            <QuickActionLink href="/health" label="Add Health Record" />
            <QuickActionLink href="/garden" label="Add Crop" />
            </div>

            <button
              className="mt-3 w-full rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => setQuickActionsOpen(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">
              Weather
            </p>

            {weather ? (
              <>
                <p className="text-3xl font-bold">
                  {weather.temperature}°F
                </p>

                <p>
                  {weather.label} in {weather.location}
                </p>
              </>
            ) : (
              <p>
                {weatherMessage}
              </p>
            )}
          </div>

          <CloudSun size={34} />
        </div>
      </div>

<div className="bg-white p-4 rounded-xl shadow mb-5">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold">
      Recent Activity
    </h2>

    <Clock size={24} />
  </div>

  {recentActivities.length === 0 ? (
    <p className="text-gray-600">
      No recent activity yet.
    </p>
  ) : (
    <div className="grid gap-3">
      {recentActivities.map((activity) => (
        <Link
          key={activity.id}
          href={activity.href}
          className="border rounded-lg p-3 block"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold">
                {activity.title}
              </p>

              <p className="text-sm text-gray-600">
                {activity.type} · {activity.subtitle}
              </p>
            </div>

            <p className="text-sm text-gray-500 whitespace-nowrap">
              {formatActivityDate(activity.date)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )}
</div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <DashboardCard
          href="/animals"
          title="Total Animals"
          value={totalAnimals}
          icon={<Bird size={22} />}
        />

        <DashboardCard
          href="/breeding"
          title="Active Breedings"
          value={activeBreedings}
          icon={<Egg size={22} />}
        />

        <DashboardCard
          href="/chicks"
          title="Active Young Stock"
          value={activeYoungStock}
          icon={<Baby size={22} />}
        />

        <DashboardCard
          href="/breeding"
          title="Hatch Reminders"
          value={hatchReminders}
          icon={<Home size={22} />}
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-5">
        <h2 className="text-xl font-bold mb-4">
          Animal Breakdown
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <BreakdownCard label="Poultry" value={poultry} />
          <BreakdownCard label="Goats" value={goats} />
          <BreakdownCard label="Sheep" value={sheep} />
          <BreakdownCard label="Cattle" value={cattle} />
          <BreakdownCard label="Pigs" value={pigs} />
          <BreakdownCard label="Horses" value={horses} />
          <BreakdownCard label="Bees" value={bees} />
          <BreakdownCard label="Other" value={otherAnimals} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-5">
        <h2 className="text-xl font-bold mb-4">
          Finance
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MoneyCard href="/sales" label="Sales" value={totalSales} icon={<DollarSign size={22} />} />
          <MoneyCard href="/expenses" label="Expenses" value={totalExpenses} icon={<ReceiptText size={22} />} />
          <MoneyCard href="/sales" label="Net" value={totalSales - totalExpenses} icon={<DollarSign size={22} />} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-5">
        <h2 className="text-xl font-bold mb-4">
          Garden
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <IconBreakdownCard href="/garden" label="Beds" value={gardenBeds} icon={<Sprout size={22} />} />
          <IconBreakdownCard href="/garden" label="Active Crops" value={activeCrops} icon={<Sprout size={22} />} />
          <IconBreakdownCard href="/garden" label="Harvests Soon" value={upcomingHarvests} icon={<Sprout size={22} />} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">
          Health
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <IconBreakdownCard href="/health" label="Records" value={healthRecords} icon={<HeartPulse size={22} />} />
          <MoneyCard href="/health" label="Health Costs" value={healthCosts} icon={<HeartPulse size={22} />} />
        </div>
      </div>
    </div>
    
  )
}

function formatActivityDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
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

function DashboardCard({
  href,
  title,
  value,
  icon,
}: {
  href: string
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Link href={href}>
      <div className="flex min-h-24 items-center justify-between gap-3 rounded-lg bg-white p-3 shadow">
        <div className="min-w-0">
          <p className="text-xs leading-tight text-gray-600 sm:text-sm">
            {title}
          </p>

          <p className="text-2xl font-bold leading-tight">
            {value}
          </p>
        </div>

        <div className="text-gray-700">
          {icon}
        </div>
      </div>
    </Link>
  )
}

function BreakdownCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="border p-3 rounded-lg">
      <p className="text-gray-600">
        {label}
      </p>

      <p className="text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}

function IconBreakdownCard({
  href,
  label,
  value,
  icon,
}: {
  href: string
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Link href={href}>
      <div className="border p-3 rounded-lg">
        <div className="mb-2 text-gray-700">
          {icon}
        </div>

        <p className="text-gray-600">
          {label}
        </p>

        <p className="text-2xl font-bold">
          {value}
        </p>
      </div>
    </Link>
  )
}

function MoneyCard({
  href,
  label,
  value,
  icon,
}: {
  href: string
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Link href={href}>
      <div className="border p-3 rounded-lg">
        <div className="mb-2 text-gray-700">
          {icon}
        </div>

        <p className="text-gray-600">
          {label}
        </p>

        <p className="text-2xl font-bold">
          ${value.toFixed(2)}
        </p>
      </div>
    </Link>
  )
  
}
function QuickActionLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow border text-right"
    >
      {label}
    </Link>
  )
}
