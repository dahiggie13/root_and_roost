'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient()

export default function CoopDetailPage() {
  const params = useParams()
  const coopId = params.id as string
const [userId, setUserId] = useState('')
  const [coop, setCoop] = useState<any>(null)
  const [animals, setAnimals] = useState<any[]>([])
const [allAnimals, setAllAnimals] = useState<any[]>([])
const [selectedAnimalId, setSelectedAnimalId] = useState('')

  async function fetchCoop(currentUserId = userId) {
    if (!currentUserId) return

    const { data, error } = await supabase
      .from('coops')
      .select('*')
      .eq('id', coopId)
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setCoop(data)
  }

  async function fetchAllAnimals(currentUserId = userId) {
  if (!currentUserId) {
    setAllAnimals([])
    return
  }

  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('user_id', currentUserId)
    .order('name')

  if (error) {
    console.log(error)
    alert(error.message)
    return
  }

  setAllAnimals(data || [])
}

  async function fetchAnimals(currentUserId = userId) {
    if (!currentUserId) {
      setAnimals([])
      return
    }

    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('coop_id', coopId)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setAnimals(data || [])
  }

  async function moveAnimalToCoop() {
  if (!selectedAnimalId) {
    alert('Please select an animal')
    return
  }

  const { error } = await supabase
    .from('animals')
    .update({
      coop_id: coopId,
    })
    .eq('id', selectedAnimalId)
    .eq('user_id', userId)

  if (error) {
    console.log(error)
    alert(error.message)
    return
  }

  setSelectedAnimalId('')
  fetchAnimals()
  fetchAllAnimals()
}

  useEffect(() => {
  async function loadUserData() {
    if (!coopId) return

    const { data } = await supabase.auth.getUser()

    if (!data.user) return

    setUserId(data.user.id)
    fetchCoop(data.user.id)
    fetchAnimals(data.user.id)
    fetchAllAnimals(data.user.id)
  }

  loadUserData()
}, [coopId])

  if (!coop) {
    return <p>Loading coop or pasture...</p>
  }

function getAnimalDisplayName(animal: any) {
  if (animal.name) {
    return animal.name
  }

  if (animal.band_number) {
    return `Band ${animal.band_number}`
  }

  if (animal.animal_type) {
    return `Unnamed ${animal.animal_type}`
  }

  return 'Unnamed Animal'
}

function getLocationTypeLabel(type: string) {
  if (type === 'coop') return 'Coop'
  if (type === 'brooder') return 'Brooder'
  if (type === 'pasture') return 'Pasture'
  if (type === 'stall') return 'Stall'
  if (type === 'hive_yard') return 'Hive Yard'
  if (type === 'garden_area') return 'Garden Area'
  return 'Other'
}

  return (
    <div>
      <Link href="/coops" className="text-blue-600 underline">
        Back to Coops / Pastures
      </Link>

      <div className="bg-white p-4 rounded-xl shadow mt-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">{coop.name}</h1>

        <p>Location: {coop.location}</p>
        <p>Type: {getLocationTypeLabel(coop.location_type)}</p>
        <p>Description: {coop.description}</p>

        <p className="font-bold mt-3">
          Animals Assigned: {animals.length}
        </p>
      </div>

<div className="bg-white p-4 rounded-xl shadow mb-6">
  <h2 className="text-xl font-bold mb-4">
    Move Animal Into This Coop / Pasture
  </h2>

  <select
    className="border p-2 w-full mb-3"
    value={selectedAnimalId}
    onChange={(e) => setSelectedAnimalId(e.target.value)}
  >
    <option value="">Select Animal</option>

    {allAnimals
      .filter((animal) => animal.coop_id !== coopId)
      .map((animal) => (
        <option key={animal.id} value={animal.id}>
          {animal.name} — {animal.animal_type}
        </option>
      ))}
  </select>

  <button
    className="bg-black text-white px-4 py-2 rounded"
    onClick={moveAnimalToCoop}
  >
    Move to This Coop / Pasture
  </button>
</div>

      <h2 className="text-2xl font-bold mb-4">
        Animals in this Coop / Pasture
      </h2>

      <div className="grid gap-4">
        {animals.length === 0 ? (
          <p>No animals assigned to this coop or pasture yet.</p>
        ) : (
          animals.map((animal) => (
            <div
              key={animal.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <h3 className="text-xl font-bold capitalize">
  {getAnimalDisplayName(animal)}
</h3>

              <p>Type: {animal.animal_type}</p>
              <p>Breed: {animal.breed}</p>
              <p>Gender: {animal.gender}</p>
              <p>Band Number: {animal.band_number}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
