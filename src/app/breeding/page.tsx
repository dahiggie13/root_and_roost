'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function BreedingPage() {
  const [animals, setAnimals] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
const [userId, setUserId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [maleAnimalId, setMaleAnimalId] = useState('')
  const [femaleAnimalId, setFemaleAnimalId] = useState('')
  const [eggsSetDate, setEggsSetDate] = useState('')
  const [expectedHatchDate, setExpectedHatchDate] = useState('')
  const [actualHatchDate, setActualHatchDate] = useState('')
  const [chicksHatched, setChicksHatched] = useState('')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')
const [showForm, setShowForm] = useState(false)

const [editingId, setEditingId] = useState<string | null>(null)

const [editForm, setEditForm] = useState({
  project_name: '',
  male_animal_id: '',
  female_animal_id: '',
  eggs_set_date: '',
  expected_hatch_date: '',
  actual_hatch_date: '',
  chicks_hatched: '',
  status: 'active',
  notes: '',
})

  async function fetchAnimals(currentUserId = userId) {
    if (!currentUserId) {
      setAnimals([])
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

    setAnimals(data || [])
  }

  async function fetchProjects(currentUserId = userId) {
    if (!currentUserId) {
      setProjects([])
      return
    }

    const { data, error } = await supabase
      .from('breeding_projects')
      .select(`
        *,
        male:male_animal_id (
          id,
          name,
          animal_type,
          breed,
          band_number
        ),
        female:female_animal_id (
          id,
          name,
          animal_type,
          breed,
          band_number
        )
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setProjects(data || [])
  }

  async function addProject() {
    if (!projectName) {
      alert('Please enter a breeding project name')
      return
    }

    const { error } = await supabase
      .from('breeding_projects')
      .insert([
        {
          user_id: userId,
          project_name: projectName,
          male_animal_id: maleAnimalId || null,
          female_animal_id: femaleAnimalId || null,
          eggs_set_date: eggsSetDate || null,
          expected_hatch_date: expectedHatchDate || null,
          actual_hatch_date: actualHatchDate || null,
          chicks_hatched: chicksHatched ? Number(chicksHatched) : 0,
          status,
          notes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setProjectName('')
    setMaleAnimalId('')
    setFemaleAnimalId('')
    setEggsSetDate('')
    setExpectedHatchDate('')
    setActualHatchDate('')
    setChicksHatched('')
    setStatus('active')
    setNotes('')

    fetchProjects()
  }

  async function updateProject(id: string) {
  const { error } = await supabase
    .from('breeding_projects')
    .update({
      project_name: editForm.project_name,
      male_animal_id: editForm.male_animal_id || null,
      female_animal_id: editForm.female_animal_id || null,
      eggs_set_date: editForm.eggs_set_date || null,
      expected_hatch_date: editForm.expected_hatch_date || null,
      actual_hatch_date: editForm.actual_hatch_date || null,
      chicks_hatched: editForm.chicks_hatched
        ? Number(editForm.chicks_hatched)
        : 0,
      status: editForm.status,
      notes: editForm.notes,
    })
    .eq('id', id)

  if (error) {
    console.log(error)
    alert(error.message)
    return
  }

  setEditingId(null)
  fetchProjects()
}

  async function deleteProject(id: string) {
    const { error } = await supabase
      .from('breeding_projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchProjects()
  }

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchAnimals(data.user.id)
      fetchProjects(data.user.id)
    }

    loadUserData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Breeding
      </h1>

<button
  className="bg-black text-white px-4 py-2 rounded mb-6"
  onClick={() => setShowForm(!showForm)}
>
  {showForm ? 'Close Form' : '+ Add Breeding Project'}
</button>
{showForm && (
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Add Breeding Project
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Breeding Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-3"
          value={maleAnimalId}
          onChange={(e) => setMaleAnimalId(e.target.value)}
        >
          <option value="">Select Male</option>

          {animals
            .filter((animal) => animal.gender === 'male')
            .map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} — {animal.breed} — {animal.band_number}
              </option>
            ))}
        </select>

        <select
          className="border p-2 w-full mb-3"
          value={femaleAnimalId}
          onChange={(e) => setFemaleAnimalId(e.target.value)}
        >
          <option value="">Select Female</option>

          {animals
            .filter((animal) => animal.gender === 'female')
            .map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} — {animal.breed} — {animal.band_number}
              </option>
            ))}
        </select>

        <div className="mb-3">
  <label className="block font-medium mb-1">
    Eggs Set Date
  </label>

  <input
    className="border p-2 w-full"
    type="date"
    value={eggsSetDate}
    onChange={(e) => setEggsSetDate(e.target.value)}
  />
</div>

        <div className="mb-3">
  <label className="block font-medium mb-1">
    Expected Hatch Date
  </label>

  <input
    className="border p-2 w-full"
    type="date"
    value={expectedHatchDate}
    onChange={(e) => setExpectedHatchDate(e.target.value)}
  />
</div>

        <div className="mb-3">
  <label className="block font-medium mb-1">
    Actual Hatch Date
  </label>

  <input
    className="border p-2 w-full"
    type="date"
    value={actualHatchDate}
    onChange={(e) => setActualHatchDate(e.target.value)}
  />
</div>

        <input
          className="border p-2 w-full mb-3"
          type="number"
          placeholder="Chicks Hatched"
          value={chicksHatched}
          onChange={(e) => setChicksHatched(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={addProject}
        >
          Add Breeding Project
        </button>
      </div>
)}
      <div className="grid gap-4">
        {projects.map((project) => (
          
          <div
            key={project.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            {editingId === project.id ? (
  <div className="grid gap-2">
    <input
      className="border p-2"
      placeholder="Breeding Project Name"
      value={editForm.project_name}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          project_name: e.target.value,
        })
      }
    />

    <select
      className="border p-2"
      value={editForm.male_animal_id}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          male_animal_id: e.target.value,
        })
      }
    >
      <option value="">Select Male</option>

      {animals
        .filter((animal) => animal.gender === 'male')
        .map((animal) => (
          <option key={animal.id} value={animal.id}>
            {animal.name || animal.band_number || 'Unnamed'} — {animal.breed}
          </option>
        ))}
    </select>

    <select
      className="border p-2"
      value={editForm.female_animal_id}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          female_animal_id: e.target.value,
        })
      }
    >
      <option value="">Select Female</option>

      {animals
        .filter((animal) => animal.gender === 'female')
        .map((animal) => (
          <option key={animal.id} value={animal.id}>
            {animal.name || animal.band_number || 'Unnamed'} — {animal.breed}
          </option>
        ))}
    </select>

    <div>
      <label className="block font-medium mb-1">
        Eggs Set Date
      </label>

      <input
        className="border p-2 w-full"
        type="date"
        value={editForm.eggs_set_date}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            eggs_set_date: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        Expected Hatch Date
      </label>

      <input
        className="border p-2 w-full"
        type="date"
        value={editForm.expected_hatch_date}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            expected_hatch_date: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        Actual Hatch Date
      </label>

      <input
        className="border p-2 w-full"
        type="date"
        value={editForm.actual_hatch_date}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            actual_hatch_date: e.target.value,
          })
        }
      />
    </div>

    <input
      className="border p-2"
      type="number"
      placeholder="Chicks Hatched"
      value={editForm.chicks_hatched}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          chicks_hatched: e.target.value,
        })
      }
    />

    <select
      className="border p-2"
      value={editForm.status}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          status: e.target.value,
        })
      }
    >
      <option value="active">Active</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>

    <textarea
      className="border p-2"
      placeholder="Notes"
      value={editForm.notes}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          notes: e.target.value,
        })
      }
    />
  </div>
) : (
  <div>
    <h2 className="text-xl font-bold">
      {project.project_name}
    </h2>

    <p>Status: {project.status}</p>
    <p>Expected Hatch: {project.expected_hatch_date || 'Not set'}</p>
    <p>Actual Hatch: {project.actual_hatch_date || 'Not set'}</p>
  </div>
)}

            <button
              className="bg-red-500 text-white px-3 py-1 rounded mt-3"
              onClick={() => deleteProject(project.id)}
            >
              Delete
            </button>

            {editingId === project.id ? (
  <>
  <button
    className="bg-green-500 text-white px-3 py-1 rounded mt-3 ml-2"
    onClick={() => updateProject(project.id)}
  >
    Save
  </button>

  <button
    className="border px-3 py-1 rounded mt-3 ml-2"
    onClick={() => setEditingId(null)}
  >
    Cancel
  </button>
  </>
) : (
  <button
    className="bg-blue-500 text-white px-3 py-1 rounded mt-3 ml-2"
    onClick={() => {
      setEditingId(project.id)

      setEditForm({
        project_name: project.project_name || '',
        male_animal_id: project.male_animal_id || '',
        female_animal_id: project.female_animal_id || '',
        eggs_set_date: project.eggs_set_date || '',
        expected_hatch_date: project.expected_hatch_date || '',
        actual_hatch_date: project.actual_hatch_date || '',
        chicks_hatched: project.chicks_hatched?.toString() || '',
        status: project.status || 'active',
        notes: project.notes || '',
      })
    }}
  >
    Edit
  </button>
)}

<Link
  href={`/breeding/${project.id}`}
  className="bg-black text-white px-3 py-1 rounded mt-3 ml-2 inline-block"
>
  View
</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
