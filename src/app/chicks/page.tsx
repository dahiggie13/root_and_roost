'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Filter } from 'lucide-react'

const supabase = createClient()

export default function ChicksPage() {
  const [chicks, setChicks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [coops, setCoops] = useState<any[]>([])
const [animalType, setAnimalType] = useState('')
const [animalSubtype, setAnimalSubtype] = useState('')
const [filterPromoted, setFilterPromoted] = useState('active')
const [showFilters, setShowFilters] = useState(false)
const [userId, setUserId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
const [filterGender, setFilterGender] = useState('all')
const [filterCoopId, setFilterCoopId] = useState('all')

  const [showForm, setShowForm] = useState(false)

  const [bandNumber, setBandNumber] = useState('')
  const [name, setName] = useState('')
  const [numberToAdd, setNumberToAdd] = useState('1')
  const [breedingProjectId, setBreedingProjectId] = useState('')
  const [gender, setGender] = useState('unknown')
  const [breed, setBreed] = useState('')
  const [color, setColor] = useState('')
  const [hatchDate, setHatchDate] = useState('')
  const [coopId, setCoopId] = useState('')
  const [notes, setNotes] = useState('')
  const [youngStockImageFile, setYoungStockImageFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editImageFiles, setEditImageFiles] = useState<Record<string, File | null>>({})
  const [editForm, setEditForm] = useState({
    band_number: '',
    name: '',
    animal_type: '',
    animal_subtype: '',
    breeding_project_id: '',
    gender: 'unknown',
    breed: '',
    color: '',
    hatch_date: '',
    coop_id: '',
    notes: '',
    image_url: '',
  })

  async function uploadYoungStockImage(file: File | null) {
    if (!file || !userId) {
      return null
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/young-stock/${Date.now()}.${fileExt}`

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

  async function fetchChicks(currentUserId = userId) {
    if (!currentUserId) {
      setChicks([])
      return
    }

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
          name
        )
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setChicks(data || [])
  }

  async function fetchProjects(currentUserId = userId) {
    if (!currentUserId) {
      setProjects([])
      return
    }

    const { data, error } = await supabase
      .from('breeding_projects')
      .select('*')
      .eq('user_id', currentUserId)
      .order('project_name')

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setProjects(data || [])
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
      alert(error.message)
      return
    }

    setCoops(data || [])
  }

  async function addChick() {
    const count = Math.max(1, Number(numberToAdd) || 1)
    let uploadedImageUrl: string | null = null

    try {
      uploadedImageUrl = await uploadYoungStockImage(youngStockImageFile)
    } catch (error: any) {
      console.log(error)
      alert(error.message)
      return
    }

    const newChicks = Array.from({ length: count }, (_, index) => ({
          user_id: userId,
          band_number: count > 1 && bandNumber ? `${bandNumber}-${index + 1}` : bandNumber,
          name: count > 1 && name ? `${name} ${index + 1}` : name,
          animal_type: animalType || null,
          animal_subtype: animalType === 'poultry' ? animalSubtype : null,
          breeding_project_id: breedingProjectId || null,
          gender: gender || null,
          breed: breed || null,
          color: color || null,
          hatch_date: hatchDate || null,
          coop_id: coopId || null,
          notes: notes || null,
          image_url: uploadedImageUrl || null,
        }))

    const { error } = await supabase
      .from('chicks')
      .insert(newChicks)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setBandNumber('')
    setName('')
    setNumberToAdd('1')
    setAnimalType('')
    setAnimalSubtype('')
    setBreedingProjectId('')
    setGender('unknown')
    setBreed('')
    setColor('')
    setHatchDate('')
    setCoopId('')
    setNotes('')
    setYoungStockImageFile(null)
    setShowForm(false)

    fetchChicks()
  }

  async function deleteChick(id: string) {
    const { error } = await supabase
      .from('chicks')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchChicks()
  }

  async function updateChick(id: string) {
    let uploadedImageUrl: string | null = editForm.image_url || null

    try {
      if (editImageFiles[id]) {
        uploadedImageUrl = await uploadYoungStockImage(editImageFiles[id])
      }
    } catch (error: any) {
      console.log(error)
      alert(error.message)
      return
    }

    const { error } = await supabase
      .from('chicks')
      .update({
        band_number: editForm.band_number,
        name: editForm.name,
        breeding_project_id: editForm.breeding_project_id || null,
        gender: editForm.gender || null,
        animal_type: editForm.animal_type || null,
        animal_subtype: editForm.animal_type === 'poultry' ? editForm.animal_subtype : null,
        breed: editForm.breed || null,
        color: editForm.color || null,
        hatch_date: editForm.hatch_date || null,
        coop_id: editForm.coop_id || null,
        notes: editForm.notes || null,
        image_url: uploadedImageUrl || null,
      })
      .eq('id', id)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setEditingId(null)
    setEditImageFiles({
      ...editImageFiles,
      [id]: null,
    })
    fetchChicks()
  }

async function promoteToAnimal(chick: any) {
  const { data, error } = await supabase
    .from('animals')
    .insert([
      {
        user_id: userId,
        name: chick.name,
       animal_type: chick.animal_type === 'chicken' ? 'poultry' : chick.animal_type || null,
        animal_subtype: chick.animal_subtype || (chick.animal_type === 'chicken' ? 'chicken' : null),
        breed: chick.breed || null,
        gender: chick.gender || null,
        color: chick.color || null,
        band_number: chick.band_number || null,
        notes: chick.notes || null,
        coop_id: chick.coop_id || null,
        birth_date: chick.hatch_date || null,
        image_url: chick.image_url || null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.log(error)
    alert(error.message)
    return
  }

  const { error: updateError } = await supabase
    .from('chicks')
    .update({
      promoted_to_animal: true,
      animal_id: data.id,
    })
    .eq('id', chick.id)

  if (updateError) {
    console.log(updateError)
    alert(updateError.message)
    return
  }

  fetchChicks()
}

function getYoungStockDisplayName(chick: any) {
  if (chick.name) return chick.name
  if (chick.band_number) return `Band ${chick.band_number}`
  if (chick.animal_type === 'poultry' && chick.animal_subtype) {
    return `Unnamed ${chick.animal_subtype}`
  }
  if (chick.animal_type === 'chicken') return 'Unnamed chicken'
  if (chick.animal_type) return `Unnamed ${chick.animal_type}`
  return 'Unnamed Young Stock'
}

function getYoungStockType(chick: any) {
  if (chick.animal_type === 'poultry') {
    return `Poultry${chick.animal_subtype ? ` - ${chick.animal_subtype}` : ''}`
  }

  if (chick.animal_type === 'chicken') {
    return 'Poultry - chicken'
  }

  return chick.animal_type || 'Unknown'
}

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchChicks(data.user.id)
      fetchProjects(data.user.id)
      fetchCoops(data.user.id)
    }

    loadUserData()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 sm:text-3xl sm:mb-6">
  Young Stock
</h1>

      <button
        className="bg-black text-white px-4 py-2 rounded mb-5 min-h-11 w-full sm:w-auto sm:mb-6"
        onClick={() => setShowForm(!showForm)}
      >
       {showForm ? 'Close Form' : '+ Add Young Stock'}
      </button>

      {showForm && (
        <div className="bg-white p-3 rounded-xl shadow mb-5 sm:p-4 sm:mb-6">
          <h2 className="text-xl font-bold mb-4">
  Add Young Stock
</h2>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Band Number"
            value={bandNumber}
            onChange={(e) => setBandNumber(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Name"
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
  onChange={(e) => {
    setAnimalType(e.target.value)
    if (e.target.value !== 'poultry') {
      setAnimalSubtype('')
    } else {
      setAnimalSubtype('chicken')
    }
  }}
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
    <option value="chicken">Chicken</option>
    <option value="duck">Duck</option>
    <option value="goose">Goose</option>
    <option value="turkey">Turkey</option>
    <option value="other">Other</option>
  </select>
)}

          <select
            className="border p-2 w-full mb-3"
            value={breedingProjectId}
            onChange={(e) => setBreedingProjectId(e.target.value)}
          >
            <option value="">Select Breeding Project</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>

          <select
            className="border p-2 w-full mb-3"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Breed"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Hatch Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={hatchDate}
              onChange={(e) => setHatchDate(e.target.value)}
            />
          </div>

          <select
            className="border p-2 w-full mb-3"
            value={coopId}
            onChange={(e) => setCoopId(e.target.value)}
          >
            <option value="">Select Coop / Pasture / Brooder</option>

            {coops.map((coop) => (
              <option key={coop.id} value={coop.id}>
                {coop.name}
              </option>
            ))}
          </select>

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
              onChange={(e) => setYoungStockImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            className="bg-black text-white px-4 py-2 rounded min-h-11 w-full sm:w-auto"
            onClick={addChick}
          >
           Add Young Stock
          </button>
        </div>
      )}
<div className="flex items-stretch gap-2 mb-4">
  <input
    className="border p-2 w-full"
    placeholder="Search young stock..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <button
    type="button"
    className="bg-black text-white p-2 rounded flex h-11 w-11 shrink-0 items-center justify-center"
    onClick={() => setShowFilters(!showFilters)}
    aria-label="Filter young stock"
  >
    <Filter size={22} />
  </button>
</div>

{showFilters && (
  <div className="bg-white p-3 rounded-xl shadow mb-4">
    <select
      className="border p-2 w-full mb-3"
      value={filterGender}
      onChange={(e) => setFilterGender(e.target.value)}
    >
      <option value="all">All Genders</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="unknown">Unknown</option>
    </select>

    <select
      className="border p-2 w-full mb-3"
      value={filterCoopId}
      onChange={(e) => setFilterCoopId(e.target.value)}
    >
      <option value="all">All Coops / Pastures / Brooders</option>
      <option value="none">Not Assigned</option>

      {coops.map((coop) => (
        <option key={coop.id} value={coop.id}>
          {coop.name}
        </option>
      ))}
    </select>

    <select
      className="border p-2 w-full mb-3"
      value={filterPromoted}
      onChange={(e) => setFilterPromoted(e.target.value)}
    >
      <option value="active">Active Young Stock</option>
      <option value="promoted">Promoted to Animals</option>
      <option value="all">All Young Stock</option>
    </select>

    <button
      type="button"
      className="border px-3 py-2 rounded"
      onClick={() => {
        setFilterGender('all')
        setFilterCoopId('all')
        setFilterPromoted('active')
      }}
    >
      Clear Filters
    </button>
  </div>
)}

      <div className="grid gap-3 sm:gap-4">
        {chicks
  .filter((chick) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
  search === '' ||
  chick.name?.toLowerCase().includes(search) ||
  chick.breed?.toLowerCase().includes(search) ||
  chick.band_number?.toLowerCase().includes(search) ||
  chick.color?.toLowerCase().includes(search) ||
  chick.animal_subtype?.toLowerCase().includes(search)

    const matchesGender =
      filterGender === 'all' || chick.gender === filterGender

    const matchesCoop =
      filterCoopId === 'all' ||
      (filterCoopId === 'none' && !chick.coop_id) ||
      chick.coop_id === filterCoopId

      const matchesPromoted =
  filterPromoted === 'all' ||
  (filterPromoted === 'active' && !chick.promoted_to_animal) ||
  (filterPromoted === 'promoted' && chick.promoted_to_animal)

    return matchesSearch && matchesGender && matchesCoop && matchesPromoted
  })
  .map((chick) => (
          <div
            key={chick.id}
            className="bg-white p-3 rounded-xl shadow sm:p-4"
          >
            {editingId === chick.id ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="border p-2"
                  placeholder="Band Number"
                  value={editForm.band_number}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      band_number: e.target.value,
                    })
                  }
                />

                <input
                  className="border p-2"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                />

<select
  className="border p-2"
  value={editForm.animal_type}
  onChange={(e) =>
    setEditForm({
      ...editForm,
      animal_type: e.target.value,
      animal_subtype: e.target.value === 'poultry' ? editForm.animal_subtype || 'chicken' : '',
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
    <option value="chicken">Chicken</option>
    <option value="duck">Duck</option>
    <option value="goose">Goose</option>
    <option value="turkey">Turkey</option>
    <option value="other">Other</option>
  </select>
)}

                <select
                  className="border p-2"
                  value={editForm.breeding_project_id}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      breeding_project_id: e.target.value,
                    })
                  }
                >
                  <option value="">No Breeding Project</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>

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
                  <option value="unknown">Unknown</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <input
                  className="border p-2"
                  placeholder="Breed"
                  value={editForm.breed}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      breed: e.target.value,
                    })
                  }
                />

                <input
                  className="border p-2"
                  placeholder="Color"
                  value={editForm.color}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      color: e.target.value,
                    })
                  }
                />

                <div>
                  <label className="block font-medium mb-1">
                    Hatch Date
                  </label>

                  <input
                    className="border p-2 w-full"
                    type="date"
                    value={editForm.hatch_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        hatch_date: e.target.value,
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
                  <option value="">No Coop / Pasture / Brooder Assigned</option>

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
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      notes: e.target.value,
                    })
                  }
                />

                {editForm.image_url && (
                  <img
                    className="h-24 w-24 rounded-lg object-cover border sm:col-span-2"
                    src={editForm.image_url}
                    alt={editForm.name || 'Young stock'}
                  />
                )}

                <input
                  className="border p-2 sm:col-span-2"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditImageFiles({
                      ...editImageFiles,
                      [chick.id]: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                {chick.image_url && (
                  <img
                    className="h-16 w-16 shrink-0 rounded-lg object-cover border"
                    src={chick.image_url}
                    alt={getYoungStockDisplayName(chick)}
                  />
                )}

                <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight sm:text-xl">
                  {getYoungStockDisplayName(chick)}
                </h2>

                <p className="text-sm sm:text-base">Type: {getYoungStockType(chick)}</p>
                <p className="text-sm sm:text-base">Breed: {chick.breed || 'Unknown'}</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium"
                  onClick={() => deleteChick(chick.id)}
                >
                  Delete
                </button>

                {editingId === chick.id ? (
                  <>
                  <button
                    className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium"
                    onClick={() => updateChick(chick.id)}
                  >
                    Save
                  </button>

                  <button
                    className="border px-3 py-2 rounded text-sm font-medium"
                    onClick={() => {
                      setEditingId(null)
                      setEditImageFiles({
                        ...editImageFiles,
                        [chick.id]: null,
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
                      setEditingId(chick.id)
                      setEditForm({
                        band_number: chick.band_number || '',
                        name: chick.name || '',
                        breeding_project_id: chick.breeding_project_id || '',
                        gender: chick.gender || 'unknown',
                        breed: chick.breed || '',
                        color: chick.color || '',
                        animal_type: chick.animal_type === 'chicken' ? 'poultry' : chick.animal_type || 'poultry',
                        animal_subtype:
                          chick.animal_subtype ||
                          (chick.animal_type === 'chicken' ? 'chicken' : ''),
                        hatch_date: chick.hatch_date || '',
                        coop_id: chick.coop_id || '',
                        notes: chick.notes || '',
                        image_url: chick.image_url || '',
                      })
                    }}
                  >
                    Edit
                  </button>
                )}

                <Link
                  href={`/chicks/${chick.id}`}
                  className="bg-black text-white px-3 py-2 rounded text-sm font-medium"
                >
                  View
                </Link>
              </div>

              {!chick.promoted_to_animal && (
                <button
                  type="button"
                  className="self-end rounded border px-3 py-2 text-sm font-bold shadow"
                  style={{
                    backgroundColor: '#047857',
                    borderColor: '#065f46',
                    color: '#ffffff',
                  }}
                  onClick={() => promoteToAnimal(chick)}
                >
                  Promote
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
