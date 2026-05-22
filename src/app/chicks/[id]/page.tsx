'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function YoungStockDetailPage() {
  const params = useParams()
  const youngStockId = params.id as string

const [sales, setSales] = useState<any[]>([])
const [healthRecords, setHealthRecords] = useState<any[]>([])
const [breedingProjects, setBreedingProjects] = useState<any[]>([])

  const [userId, setUserId] = useState('')
  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function fetchYoungStock(currentUserId = userId) {
    if (!currentUserId || !youngStockId) return

    const { data, error } = await supabase
      .from('chicks')
      .select(`
        *,
        breeding_projects (
          id,
          project_name
        ),
        coops (
          id,
          name,
          location
        ),
        animals (
          id,
          name,
          animal_type,
          animal_subtype,
          band_number
        )
      `)
      .eq('id', youngStockId)
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.log(error)
      setRecord(null)
      return
    }

    setRecord(data)
  }

async function fetchSales(currentUserId = userId, animalId?: string) {
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

async function fetchHealthRecords(currentUserId = userId, animalId?: string) {
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

async function fetchBreedingProjects(currentUserId = userId, animalId?: string) {
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
    async function loadYoungStockData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setLoading(false)
        return
      }

      setUserId(data.user.id)
     const { data: youngStockData, error } = await supabase
  .from('chicks')
  .select(`
    *,
    breeding_projects (
      id,
      project_name
    ),
    coops (
      id,
      name,
      location
    ),
    animals (
      id,
      name,
      animal_type,
      animal_subtype,
      band_number
    )
  `)
  .eq('id', youngStockId)
  .eq('user_id', data.user.id)
  .single()

if (error) {
  console.log(error)
  setRecord(null)
  setLoading(false)
  return
}

setRecord(youngStockData)

if (youngStockData.animal_id) {
  await fetchSales(data.user.id, youngStockData.animal_id)
  await fetchHealthRecords(data.user.id, youngStockData.animal_id)
  await fetchBreedingProjects(data.user.id, youngStockData.animal_id)
}

setLoading(false)
    }

    loadYoungStockData()
  }, [youngStockId])

  function getDisplayName() {
    if (!record) return 'Young Stock'
    if (record.name) return record.name
    if (record.band_number) return `Band ${record.band_number}`
    if (record.animal_type === 'poultry' && record.animal_subtype) {
      return `Unnamed ${record.animal_subtype}`
    }
    if (record.animal_type === 'chicken') return 'Unnamed chicken'
    if (record.animal_type) return `Unnamed ${record.animal_type}`
    return 'Unnamed Young Stock'
  }

  function getType() {
    if (record?.animal_type === 'poultry') {
      return `Poultry${record.animal_subtype ? ` - ${record.animal_subtype}` : ''}`
    }

    if (record?.animal_type === 'chicken') {
      return 'Poultry - chicken'
    }

    return record?.animal_type || 'Unknown'
  }

  if (loading) {
    return <p>Loading young stock...</p>
  }

  if (!record) {
    return (
      <div>
        <Link href="/chicks" className="text-blue-600 underline">
          Back to Young Stock
        </Link>

        <p className="mt-4">
          Young stock not found.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/chicks" className="text-blue-600 underline">
        Back to Young Stock
      </Link>

      <div className="bg-white p-4 rounded-xl shadow mt-4 mb-6">
        {record.image_url && (
          <img
            className="mb-4 h-48 w-full rounded-xl object-cover border"
            src={record.image_url}
            alt={getDisplayName()}
          />
        )}

        <h1 className="text-3xl font-bold mb-2 capitalize">
          {getDisplayName()}
        </h1>

        <p>Type: {getType()}</p>
        <p>Breed: {record.breed || 'Unknown'}</p>
        <p>Gender: {record.gender || 'Unknown'}</p>
        <p>Color: {record.color || 'Unknown'}</p>
        <p>Band Number: {record.band_number || 'None'}</p>
        <p>Hatch Date: {record.hatch_date || 'Unknown'}</p>
        <p>Breeding Project: {record.breeding_projects?.project_name || 'None'}</p>
        <p>Coop / Pasture / Brooder: {record.coops?.name || 'Not assigned'}</p>
        <p>Promoted: {record.promoted_to_animal ? 'Yes' : 'No'}</p>
        <p>
          Animal Record:{' '}
          {record.animals ? (
            <Link href={`/animals/${record.animals.id}`} className="text-blue-600 underline">
              View Animal
            </Link>
          ) : (
            'None'
          )}
        </p>
        <p>Notes: {record.notes || 'None'}</p>
      </div>
    
    {record.animal_id && (
  <div className="grid gap-4 mb-6">
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">
        Linked Records Summary
      </h2>

      <p>Sales: {sales.length}</p>
      <p>Health Records: {healthRecords.length}</p>
      <p>Breeding Projects: {breedingProjects.length}</p>
    </div>
  </div>
)}
    
{record.animal_id && (
  <>
    <h2 className="text-2xl font-bold mb-4">
      Linked Sales
    </h2>

    <div className="grid gap-4 mb-6">
      {sales.length === 0 ? (
        <p>No sales linked to the promoted animal record yet.</p>
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
          </div>
        ))
      )}
    </div>
  </>
)}

{record.animal_id && (
  <>
    <h2 className="text-2xl font-bold mb-4">
      Health Records
    </h2>

    <div className="grid gap-4 mb-6">
      {healthRecords.length === 0 ? (
        <p>No health records linked to the promoted animal record yet.</p>
      ) : (
        healthRecords.map((health) => (
          <div
            key={health.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            <h3 className="text-xl font-bold">
              {health.record_type}
            </h3>

            <p>Date: {health.record_date || 'Not set'}</p>
            <p>Treatment: {health.treatment || 'None'}</p>
            <p>Provider: {health.provider || 'None'}</p>
            <p>Cost: ${Number(health.cost || 0).toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  </>
)}

{record.animal_id && (
  <>
    <h2 className="text-2xl font-bold mb-4">
      Breeding History
    </h2>

    <div className="grid gap-4">
      {breedingProjects.length === 0 ? (
        <p>No breeding projects linked to the promoted animal record yet.</p>
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
              {project.male_animal_id === record.animal_id ? 'Male' : 'Female'}
            </p>
            <p>Expected Hatch: {project.expected_hatch_date || 'Not set'}</p>
            <p>Actual Hatch: {project.actual_hatch_date || 'Not set'}</p>

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
  </>
)}

    </div>
  )
}
