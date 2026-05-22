'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function AnimalDetailPage() {
  const params = useParams()
  const animalId = params.id as string
const [healthRecords, setHealthRecords] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [animal, setAnimal] = useState<any>(null)
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [breedingProjects, setBreedingProjects] = useState<any[]>([])

  async function fetchAnimal(currentUserId = userId) {
    if (!currentUserId || !animalId) return

    const { data, error } = await supabase
      .from('animals')
      .select(`
        *,
        coops (
          id,
          name,
          location
        )
      `)
      .eq('id', animalId)
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.log(error)
      alert(error.message)
      setLoading(false)
      return
    }

    setAnimal(data)
  }

  async function fetchSales(currentUserId = userId) {
    if (!currentUserId || !animalId) return

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('animal_id', animalId)
      .order('sale_date', { ascending: false })

    if (error) {
      console.log(error)
      setSales([])
      return
    }

    setSales(data || [])
  }

async function fetchHealthRecords(currentUserId = userId) {
  if (!currentUserId || !animalId) return

  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', currentUserId)
    .eq('animal_id', animalId)
    .order('record_date', { ascending: false })

  if (error) {
    console.log(error)
    setHealthRecords([])
    return
  }

  setHealthRecords(data || [])
}

async function fetchBreedingProjects(currentUserId = userId) {
  if (!currentUserId || !animalId) return

  const { data, error } = await supabase
    .from('breeding_projects')
    .select(`
      *,
      male:male_animal_id (
        id,
        name,
        band_number
      ),
      female:female_animal_id (
        id,
        name,
        band_number
      )
    `)
    .eq('user_id', currentUserId)
    .or(`male_animal_id.eq.${animalId},female_animal_id.eq.${animalId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
    setBreedingProjects([])
    return
  }

  setBreedingProjects(data || [])
}

  useEffect(() => {
    async function loadAnimalData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)

      await fetchAnimal(data.user.id)
      await fetchSales(data.user.id)
      await fetchHealthRecords(data.user.id)
      await fetchBreedingProjects(data.user.id)

      setLoading(false)
    }

    loadAnimalData()
  }, [animalId])

  function getAnimalDisplayName() {
    if (!animal) return 'Animal'

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

  const totalSales = sales.reduce((sum, sale) => {
    return sum + Number(sale.price || 0)
  }, 0)

  if (loading) {
    return <p>Loading animal...</p>
  }

  if (!animal) {
    return (
      <div>
        <Link href="/animals" className="text-blue-600 underline">
          Back to Animals
        </Link>

        <p className="mt-4">
          Animal not found.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/animals" className="text-blue-600 underline">
        Back to Animals
      </Link>

      <div className="bg-white p-4 rounded-xl shadow mt-4 mb-6">
        {animal.image_url && (
          <img
            className="mb-4 h-48 w-full rounded-xl object-cover border"
            src={animal.image_url}
            alt={getAnimalDisplayName()}
          />
        )}

        <h1 className="text-3xl font-bold mb-2 capitalize">
          {getAnimalDisplayName()}
        </h1>

        <p>Type: {animal.animal_type || 'Unknown'}</p>
        <p>Breed: {animal.breed || 'Unknown'}</p>
        <p>Gender: {animal.gender || 'Unknown'}</p>
        <p>Color: {animal.color || 'Unknown'}</p>
        <p>Band Number: {animal.band_number || 'None'}</p>
        <p>Birth Date: {animal.birth_date || 'Unknown'}</p>
        <p>Coop / Pasture: {animal.coops?.name || 'Not assigned'}</p>
        <p>Notes: {animal.notes || 'None'}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Sales Summary
        </h2>

        <p>Total Linked Sales: {sales.length}</p>
        <p>Total Revenue: ${totalSales.toFixed(2)}</p>
      </div>

<div className="bg-white p-4 rounded-xl shadow mb-6">
  <h2 className="text-xl font-bold mb-4">
    Health Summary
  </h2>

  <p>Total Health Records: {healthRecords.length}</p>
</div>

<div className="bg-white p-4 rounded-xl shadow mb-6">
  <h2 className="text-xl font-bold mb-4">
    Breeding Summary
  </h2>

  <p>Total Breeding Projects: {breedingProjects.length}</p>
</div>

      <h2 className="text-2xl font-bold mb-4">
        Linked Sales
      </h2>

      <div className="grid gap-4">
        {sales.length === 0 ? (
          <p>No sales linked to this animal yet.</p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <h3 className="text-xl font-bold">
                {sale.item_name}
              </h3>

              <p>Type: {sale.sale_type}</p>
              <p>Quantity: {sale.quantity}</p>
              <p>Price: ${Number(sale.price || 0).toFixed(2)}</p>
              <p>Date: {sale.sale_date || 'Not set'}</p>
              <p>Buyer: {sale.buyer_name || 'None'}</p>
              <p>Notes: {sale.notes || 'None'}</p>
            </div>
          ))
        )}
      <h2 className="text-2xl font-bold mt-6 mb-4">
  Health Records
</h2>

<div className="grid gap-4">
  {healthRecords.length === 0 ? (
    <p>No health records linked to this animal yet.</p>
  ) : (
    healthRecords.map((record) => (
      <div
        key={record.id}
        className="bg-white p-4 rounded-xl shadow"
      >
        <h3 className="text-xl font-bold">
          {record.record_type}
        </h3>

        <p>Date: {record.record_date || 'Not set'}</p>
        <p>Treatment: {record.treatment || 'None'}</p>
        <p>Provider: {record.provider || 'None'}</p>
        <p>Cost: ${Number(record.cost || 0).toFixed(2)}</p>
        <p>Notes: {record.notes || 'None'}</p>
      </div>
    ))
  )}
</div>
     
    <h2 className="text-2xl font-bold mt-6 mb-4">
  Breeding History
</h2>

<div className="grid gap-4">
  {breedingProjects.length === 0 ? (
    <p>No breeding projects linked to this animal yet.</p>
  ) : (
    breedingProjects.map((project) => (
      <div
        key={project.id}
        className="bg-white p-4 rounded-xl shadow"
      >
        <h3 className="text-xl font-bold">
          {project.project_name}
        </h3>

        <p>Status: {project.status || 'Unknown'}</p>
        <p>
          Role:{' '}
          {project.male_animal_id === animalId ? 'Male' : 'Female'}
        </p>
        <p>
          Male: {project.male?.name || project.male?.band_number || 'Not selected'}
        </p>
        <p>
          Female: {project.female?.name || project.female?.band_number || 'Not selected'}
        </p>
        <p>Expected Hatch: {project.expected_hatch_date || 'Not set'}</p>
        <p>Actual Hatch: {project.actual_hatch_date || 'Not set'}</p>
        <p>Chicks Hatched: {project.chicks_hatched || 0}</p>

        <Link
  href={`/breeding/${project.id}`}
  className="bg-black text-white px-3 py-1 rounded mt-3 inline-block"
>
  View Breeding Project
</Link>
      </div>
    ))
  )}
</div> 
     
      </div>
    </div>
  )
}
