'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'
import { Filter } from 'lucide-react'

const supabase = createClient()

export default function AnimalsPage() {

  const [searchTerm, setSearchTerm] = useState('')
const [userId, setUserId] = useState('')
  const [animals, setAnimals] = useState<any[]>([])

  const [name, setName] = useState('')

  const [numberToAdd, setNumberToAdd] = useState('1')

  const [animalType, setAnimalType] = useState('')

  const [animalSubtype, setAnimalSubtype] = useState('')

  const [breed, setBreed] = useState('')

  const [gender, setGender] = useState('')

const [color, setColor] = useState('')

const [bandNumber, setBandNumber] = useState('')

const [notes, setNotes] = useState('')

const [animalImageFile, setAnimalImageFile] = useState<File | null>(null)

const [filterType, setFilterType] = useState('all')

const [showFilters, setShowFilters] = useState(false)

const [coops, setCoops] = useState<any[]>([])

const [coopId, setCoopId] = useState('')

const [birthDate, setBirthDate] = useState('')

const [showForm, setShowForm] = useState(false)

const [editingId, setEditingId] = useState<string | null>(null)

const [editImageFiles, setEditImageFiles] = useState<Record<string, File | null>>({})

const [editForm, setEditForm] = useState({
  name: '',
  animal_type: '',
  animal_subtype: '',
  breed: '',
  gender: '',
  color: '',
  band_number: '',
  notes: '',
  coop_id: '',
  birth_date: '',
  image_url: '',
})

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

  async function fetchAnimals(currentUserId = userId) {
    if (!currentUserId) {
      setAnimals([])
      return
    }

    const { data, error } = await supabase
      .from('animals')
      .select(`
  *,
  coops (
    id,
    name
  )
`)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setAnimals(data)
    }
  }

  async function addAnimal() {
    

    const count = Math.max(1, Number(numberToAdd) || 1)
    let uploadedImageUrl: string | null = null

    try {
      uploadedImageUrl = await uploadAnimalImage(animalImageFile)
    } catch (error: any) {
      console.log(error)
      alert(error.message)
      return
    }

    const newAnimals = Array.from({ length: count }, (_, index) => ({
  user_id: userId,
  name: count > 1 && name ? `${name} ${index + 1}` : name,
  animal_type: animalType || null,
  animal_subtype: animalType === 'poultry' ? animalSubtype : null,
  breed: breed || null,
  gender: gender || null,
  color: color || null,
  band_number: count > 1 && bandNumber ? `${bandNumber}-${index + 1}` : bandNumber,
  notes: notes || null,
  coop_id: coopId || null,
  birth_date: birthDate || null,
  image_url: uploadedImageUrl || null,
}))

    const { error } = await supabase
      .from('animals')
      .insert(newAnimals)

    if (error) {
      console.log(error)
    } else {
      setName('')
      setNumberToAdd('1')
      setAnimalType('')
      setAnimalSubtype('')
      setBreed('')
      setGender('')
      setColor('')
      setBandNumber('')
      setNotes('')
      setAnimalImageFile(null)
setCoopId('')
setBirthDate('')
      setShowForm(false)
      fetchAnimals()
    }
  }

  useEffect(() => {async function deleteAnimal(id: string) {

  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id)

  if (error) {
    console.log(error)
  } else {
    fetchAnimals()
  }
}
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchAnimals(data.user.id)
      fetchCoops(data.user.id)
    }

    loadUserData()
  }, [])

async function updateAnimal(id: string) {
  let uploadedImageUrl: string | null = editForm.image_url || null

  try {
    if (editImageFiles[id]) {
      uploadedImageUrl = await uploadAnimalImage(editImageFiles[id])
    }
  } catch (error: any) {
    console.log(error)
    alert(error.message)
    return
  }

  const { error } = await supabase
    .from('animals')
    .update({
      name: editForm.name,
      animal_type: editForm.animal_type || null,
      animal_subtype: editForm.animal_type === 'poultry' ? editForm.animal_subtype : null,
      breed: editForm.breed || null,
      gender: editForm.gender || null,
      color: editForm.color || null,
      band_number: editForm.band_number || null,
      notes: editForm.notes || null,
      coop_id: editForm.coop_id || null,
      birth_date: editForm.birth_date || null,
      image_url: uploadedImageUrl || null,
    })
    .eq('id', id)

  if (error) {
    console.log(error)
    alert(error.message)
  } else {

    setEditingId(null)
    setEditImageFiles({
      ...editImageFiles,
      [id]: null,
    })

    fetchAnimals()
  }
}

async function deleteAnimal(id: string) {

  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id)

  if (error) {
    console.log(error)
    alert(error.message)
  } else {
    fetchAnimals()
  }
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
  } else {
    setCoops(data)
  }
}

function getAnimalDisplayName(animal: any) {
  if (animal.name) {
    return animal.name
  }

  if (animal.band_number) {
    return `Band ${animal.band_number}`
  }

  if (animal.animal_type) {
    if (animal.animal_type === 'poultry' && animal.animal_subtype) {
      return `Unnamed ${animal.animal_subtype}`
    }

    return `Unnamed ${animal.animal_type}`
  }

  return 'Unnamed Animal'
}

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4 sm:text-3xl sm:mb-6">
        Animals
      </h1>

      <button
        className="bg-black text-white px-4 py-2 rounded mb-5 min-h-11 w-full sm:w-auto sm:mb-6"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Close Form' : '+ Add Animal'}
      </button>

      {showForm && (
      <div className="bg-white p-3 rounded-xl shadow mb-5 sm:p-4 sm:mb-6">

        <h2 className="text-xl font-bold mb-4">
          Add Animal
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Animal Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          type="number"
          min="1"
          placeholder="Number to Add"
          value={numberToAdd}
          onChange={(e) => setNumberToAdd(e.target.value)}
        />

        <select
  className="border p-2 w-full mb-3"
  value={animalType}
  onChange={(e) => setAnimalType(e.target.value)}
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

{animalType === 'poultry' && (
  <select
    className="border p-2 w-full mb-3"
    value={animalSubtype}
    onChange={(e) => setAnimalSubtype(e.target.value)}
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
          className="border p-2 w-full mb-3"
          placeholder="Breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
        />
<select
  className="border p-2 w-full mb-3"
  value={gender}
  onChange={(e) => setGender(e.target.value)}
>
  <option value="">Select Gender</option>

  <option value="male">Male</option>

  <option value="female">Female</option>

  <option value="unknown">Unknown</option>
</select>

<input
  className="border p-2 w-full mb-3"
  placeholder="Color"
  value={color}
  onChange={(e) => setColor(e.target.value)}
/>

<div className="mb-3">
  <label className="block font-medium mb-1">
    Birth Date
  </label>

  <input
    className="border p-2 w-full"
    type="date"
    value={birthDate}
    onChange={(e) => setBirthDate(e.target.value)}
  />
</div>

<input
  className="border p-2 w-full mb-3"
  placeholder="Band Number"
  value={bandNumber}
  onChange={(e) => setBandNumber(e.target.value)}
/>

<textarea
  className="border p-2 w-full mb-3"
  placeholder="Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>

<div className="mb-3">
  <label className="block font-medium mb-1">
    Photo
  </label>

  <input
    className="border p-2 w-full"
    type="file"
    accept="image/*"
    onChange={(e) => setAnimalImageFile(e.target.files?.[0] || null)}
  />
</div>

<select
  className="border p-2 w-full mb-3"
  value={coopId}
  onChange={(e) => setCoopId(e.target.value)}
>
  <option value="">Select Coop / Pasture</option>

  {coops.map((coop) => (
    <option key={coop.id} value={coop.id}>
      {coop.name}
    </option>
  ))}
</select>

        <button
          className="bg-black text-white px-4 py-2 rounded min-h-11 w-full sm:w-auto"
          onClick={addAnimal}
        >
          Add Animal
        </button>

      </div>
      )}

<div className="flex items-stretch gap-2 mb-4">
  <input
    className="border p-2 w-full"
    placeholder="Search animals..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <button
    type="button"
    className="bg-black text-white p-2 rounded flex h-11 w-11 shrink-0 items-center justify-center"
    onClick={() => setShowFilters(!showFilters)}
    aria-label="Filter animals"
  >
    <Filter size={22} />
  </button>
</div>

{showFilters && (
  <div className="bg-white p-3 rounded-xl shadow mb-4">
    <select
      className="border p-2 w-full mb-3"
      value={filterType}
      onChange={(e) => setFilterType(e.target.value)}
    >
      <option value="all">All Animals</option>
      <option value="poultry">Poultry</option>
      <option value="goat">Goats</option>
      <option value="sheep">Sheep</option>
      <option value="cattle">Cattle</option>
      <option value="pig">Pigs</option>
      <option value="horse">Horses</option>
      <option value="bee">Bees</option>
      <option value="other">Other</option>
    </select>

    <button
      type="button"
      className="border px-3 py-2 rounded"
      onClick={() => setFilterType('all')}
    >
      Clear Filters
    </button>
  </div>
)}

      {/* Animal List */}
      <div className="grid gap-3 sm:gap-4">

        {animals
  .filter((animal) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      search === '' ||
      animal.name?.toLowerCase().includes(search) ||
      animal.breed?.toLowerCase().includes(search) ||
      animal.band_number?.toLowerCase().includes(search) ||
      animal.animal_subtype?.toLowerCase().includes(search)

    const matchesType =
      filterType === 'all' ||
      animal.animal_type === filterType ||
      (filterType === 'poultry' && animal.animal_type === 'chicken')

    return matchesSearch && matchesType
  })
  .map((animal) => (

          <div
            key={animal.id}
            className="bg-white p-3 rounded-xl shadow sm:p-4"
          >

            {editingId === animal.id ? (

  <div className="grid gap-2 sm:grid-cols-2">

    <input
      className="border p-2"
      value={editForm.name}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          name: e.target.value,
        })
      }
      placeholder="Name"
    />

    <select
  className="border p-2"
  value={editForm.animal_type}
  onChange={(e) =>
    setEditForm({
      ...editForm,
      animal_type: e.target.value,
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
    onChange={(e) =>
      setEditForm({
        ...editForm,
        animal_subtype: e.target.value,
      })
    }
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
      value={editForm.breed}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          breed: e.target.value,
        })
      }
      placeholder="Breed"
    />

    <select
  className="border p-2"
  value={editForm.gender}
  onChange={(e) =>
    setEditForm({
      ...editForm,
      gender: e.target.value,
    })
  }
>
  <option value="">Select Gender</option>

  <option value="male">Male</option>

  <option value="female">Female</option>

  <option value="unknown">Unknown</option>
</select>

    <input
      className="border p-2"
      value={editForm.color}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          color: e.target.value,
        })
      }
      placeholder="Color"
    />

    <input
      className="border p-2"
      value={editForm.band_number}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          band_number: e.target.value,
        })
      }
      placeholder="Band Number"
    />

<div>
  <label className="block font-medium mb-1">
    Birth Date
  </label>

  <input
    className="border p-2 w-full"
    type="date"
    value={editForm.birth_date}
    onChange={(e) =>
      setEditForm({
        ...editForm,
        birth_date: e.target.value,
      })
    }
  />
</div>

<select
  className="border p-2"
  value={editForm.coop_id}
  onChange={(e) =>
    setEditForm({
      ...editForm,
      coop_id: e.target.value,
    })
  }
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
      value={editForm.notes}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          notes: e.target.value,
        })
      }
      placeholder="Notes"
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
      onChange={(e) =>
        setEditImageFiles({
          ...editImageFiles,
          [animal.id]: e.target.files?.[0] || null,
        })
      }
    />

  </div>

) : (

  <div className="flex items-start gap-3">

    {animal.image_url && (
      <img
        className="h-16 w-16 shrink-0 rounded-lg object-cover border"
        src={animal.image_url}
        alt={getAnimalDisplayName(animal)}
      />
    )}

    <div className="min-w-0">

    <h2 className="text-lg font-bold capitalize leading-tight sm:text-xl">
  {getAnimalDisplayName(animal)}
</h2>

    <p className="text-sm sm:text-base">
      Type:{' '}
      {animal.animal_type === 'poultry'
        ? `Poultry${animal.animal_subtype ? ` - ${animal.animal_subtype}` : ''}`
        : animal.animal_type || 'Unknown'}
    </p>

   <p className="text-sm sm:text-base">Breed: {animal.breed || 'Unknown'}</p>

    </div>

  </div>

)}

            <div className="mt-4 flex flex-wrap gap-2">
            <button
  className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium"
  onClick={() => deleteAnimal(animal.id)}
>
  Delete
</button>

{editingId === animal.id ? (

  <>
  <button
    className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium"
    onClick={() => updateAnimal(animal.id)}
  >
    Save
  </button>

  <button
    className="border px-3 py-2 rounded text-sm font-medium"
    onClick={() => {
      setEditingId(null)
      setEditImageFiles({
        ...editImageFiles,
        [animal.id]: null,
      })
    }}
  >
    Cancel
  </button>
  </>

) : (

  <button
  className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium"
  onClick={() => {

    setEditingId(animal.id)

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
      notes: animal.notes || '',
      coop_id: animal.coop_id || '',
      birth_date: animal.birth_date || '',
      image_url: animal.image_url || '',
    })

  }}
>
  Edit
</button>
)}

<Link
  href={`/animals/${animal.id}`}
  className="bg-black text-white px-3 py-2 rounded text-sm font-medium inline-block"
>
  View
</Link>
            </div>
          </div>

        ))}

      </div>

    </div>
  )
}
