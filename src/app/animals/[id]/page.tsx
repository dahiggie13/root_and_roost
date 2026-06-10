'use client'

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

type Coop = {
  id: string
  name: string | null
  location?: string | null
}

type AnimalDetail = {
  id: string
  name: string | null
  animal_type: string | null
  animal_subtype: string | null
  breed: string | null
  gender: string | null
  color: string | null
  band_number: string | null
  birth_date: string | null
  coop_id: string | null
  notes: string | null
  image_url: string | null
  coops?: Coop | null
}

type Sale = {
  id: string
  item_name: string | null
  sale_type: string | null
  quantity: number | null
  price: number | string | null
  sale_date: string | null
  buyer_name: string | null
  notes: string | null
}

type HealthRecord = {
  id: string
  record_type: string | null
  record_date: string | null
  treatment: string | null
  provider: string | null
  cost: number | string | null
  notes: string | null
}

type AnimalRef = {
  id: string
  name: string | null
  band_number: string | null
}

type BreedingProject = {
  id: string
  project_name: string | null
  status: string | null
  male_animal_id: string | null
  female_animal_id: string | null
  male?: AnimalRef | null
  female?: AnimalRef | null
  expected_hatch_date: string | null
  actual_hatch_date: string | null
  chicks_hatched: number | null
}

export default function AnimalDetailPage() {
  const params = useParams()
  const animalId = params.id as string
const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [userId, setUserId] = useState('')
  const [animal, setAnimal] = useState<AnimalDetail | null>(null)
  const [coops, setCoops] = useState<Coop[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [breedingProjects, setBreedingProjects] = useState<BreedingProject[]>([])
  const [editing, setEditing] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    animal_type: '',
    animal_subtype: '',
    breed: '',
    gender: '',
    color: '',
    band_number: '',
    birth_date: '',
    coop_id: '',
    notes: '',
    image_url: '',
  })

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

async function fetchCoops(currentUserId = userId) {
  if (!currentUserId) {
    setCoops([])
    return
  }

  const { data, error } = await supabase
    .from('coops')
    .select('*')
    .eq('user_id', currentUserId)
    .order('name')

  if (error) {
    console.log(error)
    setCoops([])
    return
  }

  setCoops(data || [])
}

async function uploadAnimalImage(file: File | null) {
  if (!file || !userId) {
    return null
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/animals/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('animal-images')
    .upload(filePath, file)

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('animal-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

function startEditing() {
  if (!animal) return

  setEditForm({
    name: animal.name || '',
    animal_type: animal.animal_type === 'chicken' ? 'poultry' : animal.animal_type || '',
    animal_subtype:
      animal.animal_subtype ||
      (animal.animal_type === 'chicken' ? 'chicken' : ''),
    breed: animal.breed || '',
    gender: animal.gender || '',
    color: animal.color || '',
    band_number: animal.band_number || '',
    birth_date: animal.birth_date || '',
    coop_id: animal.coop_id || '',
    notes: animal.notes || '',
    image_url: animal.image_url || '',
  })
  setImageFile(null)
  setEditing(true)
}

async function updateAnimal() {
  let uploadedImageUrl: string | null = editForm.image_url || null

  try {
    if (imageFile) {
      uploadedImageUrl = await uploadAnimalImage(imageFile)
    }
  } catch (error: unknown) {
    console.log(error)
    alert(error instanceof Error ? error.message : 'Image upload failed')
    return
  }

  const { error } = await supabase
    .from('animals')
    .update({
      name: editForm.name || null,
      animal_type: editForm.animal_type || null,
      animal_subtype: editForm.animal_type === 'poultry' ? editForm.animal_subtype : null,
      breed: editForm.breed || null,
      gender: editForm.gender || null,
      color: editForm.color || null,
      band_number: editForm.band_number || null,
      birth_date: editForm.birth_date || null,
      coop_id: editForm.coop_id || null,
      notes: editForm.notes || null,
      image_url: uploadedImageUrl || null,
    })
    .eq('id', animalId)
    .eq('user_id', userId)

  if (error) {
    console.log(error)
    alert(error.message)
    return
  }

  setEditing(false)
  setImageFile(null)
  fetchAnimal()
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
      await fetchCoops(data.user.id)

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
        {!editing && animal.image_url && (
          <img
            className="mb-4 h-48 w-full rounded-xl object-cover border"
            src={animal.image_url}
            alt={getAnimalDisplayName()}
          />
        )}

        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="border p-2"
              placeholder="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />

            <select
              className="border p-2"
              value={editForm.animal_type}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  animal_type: e.target.value,
                  animal_subtype: e.target.value === 'poultry' ? editForm.animal_subtype : '',
                })
              }
            >
              <option value="">Select Animal Type</option>
              <option value="poultry">Poultry</option>
              <option value="goat">Goat</option>
              <option value="sheep">Sheep</option>
              <option value="cattle">Cattle</option>
              <option value="pig">Pig</option>
              <option value="horse">Horse</option>
              <option value="bee">Bee</option>
              <option value="other">Other</option>
            </select>

            {editForm.animal_type === 'poultry' && (
              <select
                className="border p-2"
                value={editForm.animal_subtype}
                onChange={(e) => setEditForm({ ...editForm, animal_subtype: e.target.value })}
              >
                <option value="">Select Poultry Type</option>
                <option value="chicken">Chicken</option>
                <option value="duck">Duck</option>
                <option value="goose">Goose</option>
                <option value="turkey">Turkey</option>
                <option value="other">Other</option>
              </select>
            )}

            <input
              className="border p-2"
              placeholder="Breed"
              value={editForm.breed}
              onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
            />

            <select
              className="border p-2"
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>

            <input
              className="border p-2"
              placeholder="Color"
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
            />

            <input
              className="border p-2"
              placeholder="Band Number"
              value={editForm.band_number}
              onChange={(e) => setEditForm({ ...editForm, band_number: e.target.value })}
            />

            <div>
              <label className="block font-medium mb-1">
                Birth Date
              </label>

              <input
                className="border p-2 w-full"
                type="date"
                value={editForm.birth_date}
                onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
              />
            </div>

            <select
              className="border p-2"
              value={editForm.coop_id}
              onChange={(e) => setEditForm({ ...editForm, coop_id: e.target.value })}
            >
              <option value="">No Coop / Pasture Assigned</option>

              {coops.map((coop) => (
                <option key={coop.id} value={coop.id}>
                  {coop.name}
                </option>
              ))}
            </select>

            <textarea
              className="border p-2 sm:col-span-2"
              placeholder="Notes"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            />

            {editForm.image_url && (
              <img
                className="h-24 w-24 rounded-lg object-cover border sm:col-span-2"
                src={editForm.image_url}
                alt={editForm.name || 'Animal'}
              />
            )}

            <input
              className="border p-2 sm:col-span-2"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={updateAnimal}
              >
                Save
              </button>

              <button
                className="border px-4 py-2 rounded"
                onClick={() => {
                  setEditing(false)
                  setImageFile(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold mb-2 capitalize">
                {getAnimalDisplayName()}
              </h1>

              <button
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium"
                onClick={startEditing}
              >
                Edit
              </button>
            </div>

            <p>Type: {animal.animal_type || 'Unknown'}</p>
            <p>Breed: {animal.breed || 'Unknown'}</p>
            <p>Gender: {animal.gender || 'Unknown'}</p>
            <p>Color: {animal.color || 'Unknown'}</p>
            <p>Band Number: {animal.band_number || 'None'}</p>
            <p>Birth Date: {animal.birth_date || 'Unknown'}</p>
            <p>Coop / Pasture: {animal.coops?.name || 'Not assigned'}</p>
            <p>Notes: {animal.notes || 'None'}</p>
          </>
        )}
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