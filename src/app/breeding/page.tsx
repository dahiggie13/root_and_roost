'use client'

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

type Animal = {
  id: string
  name: string | null
  animal_type: string | null
  animal_subtype: string | null
  breed: string | null
  band_number: string | null
  gender: string | null
}

type BreedingProject = {
  id: string
  project_name: string | null
  male_animal_id: string | null
  female_animal_id: string | null
  eggs_set_date: string | null
  expected_hatch_date: string | null
  actual_hatch_date: string | null
  chicks_hatched: number | null
  status: string | null
  notes: string | null
}

type BroodyRecord = {
  id: string
  hen_animal_id: string | null
  started_sitting_date: string | null
  egg_count: number | null
  egg_type: string | null
  live_chicks_hatched: number | null
  chicks_given: number | null
  chicks_accepted: number | null
  status: string | null
  notes: string | null
  hen?: Animal | null
}

export default function BreedingPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [projects, setProjects] = useState<BreedingProject[]>([])
  const [broodyRecords, setBroodyRecords] = useState<BroodyRecord[]>([])
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

  const [showBroodyForm, setShowBroodyForm] = useState(false)
  const [broodyHenId, setBroodyHenId] = useState('')
  const [broodyStartDate, setBroodyStartDate] = useState('')
  const [broodyEggCount, setBroodyEggCount] = useState('')
  const [broodyEggType, setBroodyEggType] = useState('real')
  const [broodyLiveHatched, setBroodyLiveHatched] = useState('')
  const [broodyChicksGiven, setBroodyChicksGiven] = useState('')
  const [broodyChicksAccepted, setBroodyChicksAccepted] = useState('')
  const [broodyStatus, setBroodyStatus] = useState('active')
  const [broodyNotes, setBroodyNotes] = useState('')
  const [editingBroodyId, setEditingBroodyId] = useState<string | null>(null)
  const [broodyEditForm, setBroodyEditForm] = useState({
    hen_animal_id: '',
    started_sitting_date: '',
    egg_count: '',
    egg_type: 'real',
    live_chicks_hatched: '',
    chicks_given: '',
    chicks_accepted: '',
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
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setProjects(data || [])
  }

  async function fetchBroodyRecords(currentUserId = userId) {
    if (!currentUserId) {
      setBroodyRecords([])
      return
    }

    const { data, error } = await supabase
      .from('broody_records')
      .select(`
        *,
        hen:hen_animal_id (
          id,
          name,
          animal_type,
          animal_subtype,
          breed,
          band_number,
          gender
        )
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      setBroodyRecords([])
      return
    }

    setBroodyRecords(data || [])
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
    setShowForm(false)
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
        chicks_hatched: editForm.chicks_hatched ? Number(editForm.chicks_hatched) : 0,
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

  async function addBroodyRecord() {
    const { error } = await supabase
      .from('broody_records')
      .insert([
        {
          user_id: userId,
          hen_animal_id: broodyHenId || null,
          started_sitting_date: broodyStartDate || null,
          egg_count: broodyEggCount ? Number(broodyEggCount) : 0,
          egg_type: broodyEggType,
          live_chicks_hatched: broodyLiveHatched ? Number(broodyLiveHatched) : 0,
          chicks_given: broodyChicksGiven ? Number(broodyChicksGiven) : 0,
          chicks_accepted: broodyChicksAccepted ? Number(broodyChicksAccepted) : 0,
          status: broodyStatus,
          notes: broodyNotes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setBroodyHenId('')
    setBroodyStartDate('')
    setBroodyEggCount('')
    setBroodyEggType('real')
    setBroodyLiveHatched('')
    setBroodyChicksGiven('')
    setBroodyChicksAccepted('')
    setBroodyStatus('active')
    setBroodyNotes('')
    setShowBroodyForm(false)
    fetchBroodyRecords()
  }

  async function updateBroodyRecord(id: string) {
    const { error } = await supabase
      .from('broody_records')
      .update({
        hen_animal_id: broodyEditForm.hen_animal_id || null,
        started_sitting_date: broodyEditForm.started_sitting_date || null,
        egg_count: broodyEditForm.egg_count ? Number(broodyEditForm.egg_count) : 0,
        egg_type: broodyEditForm.egg_type,
        live_chicks_hatched: broodyEditForm.live_chicks_hatched
          ? Number(broodyEditForm.live_chicks_hatched)
          : 0,
        chicks_given: broodyEditForm.chicks_given ? Number(broodyEditForm.chicks_given) : 0,
        chicks_accepted: broodyEditForm.chicks_accepted
          ? Number(broodyEditForm.chicks_accepted)
          : 0,
        status: broodyEditForm.status,
        notes: broodyEditForm.notes,
      })
      .eq('id', id)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setEditingBroodyId(null)
    fetchBroodyRecords()
  }

  async function deleteBroodyRecord(id: string) {
    const { error } = await supabase
      .from('broody_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchBroodyRecords()
  }

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchAnimals(data.user.id)
      fetchProjects(data.user.id)
      fetchBroodyRecords(data.user.id)
    }

    loadUserData()
  }, [])

  function getAnimalDisplayName(animal: Animal | null | undefined) {
    if (!animal) return 'Not selected'
    if (animal.name) return animal.name
    if (animal.band_number) return `Band ${animal.band_number}`
    if (animal.animal_type === 'poultry' && animal.animal_subtype) {
      return `Unnamed ${animal.animal_subtype}`
    }
    if (animal.animal_type) return `Unnamed ${animal.animal_type}`
    return 'Unnamed Animal'
  }

  function getDaysSitting(startDate: string | null) {
    if (!startDate) return 'Unknown'

    const start = new Date(`${startDate}T00:00:00`)
    const today = new Date()
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const difference = todayDay.getTime() - startDay.getTime()

    return Math.max(0, Math.floor(difference / 86400000)).toString()
  }

  function getExpectedHatchDate(startDate: string | null) {
    if (!startDate) return 'Unknown'

    const hatchDate = new Date(`${startDate}T00:00:00`)
    hatchDate.setDate(hatchDate.getDate() + 21)

    return hatchDate.toISOString().split('T')[0]
  }

  const hens = animals.filter((animal) => {
    return (
      animal.gender === 'female' &&
      (animal.animal_type === 'poultry' ||
        animal.animal_type === 'chicken' ||
        animal.animal_subtype === 'chicken')
    )
  })

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
                  {getAnimalDisplayName(animal)} - {animal.breed || 'Unknown breed'}
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
                  {getAnimalDisplayName(animal)} - {animal.breed || 'Unknown breed'}
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

      <div className="grid gap-4 mb-10">
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
                  onChange={(e) => setEditForm({ ...editForm, project_name: e.target.value })}
                />

                <select
                  className="border p-2"
                  value={editForm.male_animal_id}
                  onChange={(e) => setEditForm({ ...editForm, male_animal_id: e.target.value })}
                >
                  <option value="">Select Male</option>

                  {animals
                    .filter((animal) => animal.gender === 'male')
                    .map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {getAnimalDisplayName(animal)} - {animal.breed || 'Unknown breed'}
                      </option>
                    ))}
                </select>

                <select
                  className="border p-2"
                  value={editForm.female_animal_id}
                  onChange={(e) => setEditForm({ ...editForm, female_animal_id: e.target.value })}
                >
                  <option value="">Select Female</option>

                  {animals
                    .filter((animal) => animal.gender === 'female')
                    .map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {getAnimalDisplayName(animal)} - {animal.breed || 'Unknown breed'}
                      </option>
                    ))}
                </select>

                <input
                  className="border p-2"
                  type="date"
                  value={editForm.eggs_set_date}
                  onChange={(e) => setEditForm({ ...editForm, eggs_set_date: e.target.value })}
                />

                <input
                  className="border p-2"
                  type="date"
                  value={editForm.expected_hatch_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expected_hatch_date: e.target.value })
                  }
                />

                <input
                  className="border p-2"
                  type="date"
                  value={editForm.actual_hatch_date}
                  onChange={(e) => setEditForm({ ...editForm, actual_hatch_date: e.target.value })}
                />

                <input
                  className="border p-2"
                  type="number"
                  placeholder="Chicks Hatched"
                  value={editForm.chicks_hatched}
                  onChange={(e) => setEditForm({ ...editForm, chicks_hatched: e.target.value })}
                />

                <select
                  className="border p-2"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <textarea
                  className="border p-2"
                  placeholder="Notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
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

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">
          Broody Hens
        </h2>

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => setShowBroodyForm(!showBroodyForm)}
        >
          {showBroodyForm ? 'Close Form' : '+ Add Broody Hen'}
        </button>
      </div>

      {showBroodyForm && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h3 className="text-xl font-bold mb-4">
            Add Broody Hen
          </h3>

          <select
            className="border p-2 w-full mb-3"
            value={broodyHenId}
            onChange={(e) => setBroodyHenId(e.target.value)}
          >
            <option value="">Select Hen</option>

            {hens.map((hen) => (
              <option key={hen.id} value={hen.id}>
                {getAnimalDisplayName(hen)} - {hen.breed || 'Unknown breed'}
              </option>
            ))}
          </select>

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Started Sitting
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={broodyStartDate}
              onChange={(e) => setBroodyStartDate(e.target.value)}
            />
          </div>

          <input
            className="border p-2 w-full mb-3"
            type="number"
            placeholder="Number of Eggs"
            value={broodyEggCount}
            onChange={(e) => setBroodyEggCount(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-3"
            value={broodyEggType}
            onChange={(e) => setBroodyEggType(e.target.value)}
          >
            <option value="real">Real Eggs</option>
            <option value="fake">Fake Eggs</option>
            <option value="mixed">Real and Fake Eggs</option>
            <option value="unknown">Unknown</option>
          </select>

          <input
            className="border p-2 w-full mb-3"
            type="number"
            placeholder="Live Chicks Hatched"
            value={broodyLiveHatched}
            onChange={(e) => setBroodyLiveHatched(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            type="number"
            placeholder="Chicks Given to Hen"
            value={broodyChicksGiven}
            onChange={(e) => setBroodyChicksGiven(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            type="number"
            placeholder="Chicks Accepted"
            value={broodyChicksAccepted}
            onChange={(e) => setBroodyChicksAccepted(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-3"
            value={broodyStatus}
            onChange={(e) => setBroodyStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="hatched">Hatched</option>
            <option value="adoption">Adoption Attempt</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes"
            value={broodyNotes}
            onChange={(e) => setBroodyNotes(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addBroodyRecord}
          >
            Add Broody Hen
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {broodyRecords.length === 0 ? (
          <p>No broody hen records yet.</p>
        ) : (
          broodyRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              {editingBroodyId === record.id ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="border p-2"
                    value={broodyEditForm.hen_animal_id}
                    onChange={(e) =>
                      setBroodyEditForm({ ...broodyEditForm, hen_animal_id: e.target.value })
                    }
                  >
                    <option value="">Select Hen</option>

                    {hens.map((hen) => (
                      <option key={hen.id} value={hen.id}>
                        {getAnimalDisplayName(hen)} - {hen.breed || 'Unknown breed'}
                      </option>
                    ))}
                  </select>

                  <input
                    className="border p-2"
                    type="date"
                    value={broodyEditForm.started_sitting_date}
                    onChange={(e) =>
                      setBroodyEditForm({
                        ...broodyEditForm,
                        started_sitting_date: e.target.value,
                      })
                    }
                  />

                  <input
                    className="border p-2"
                    type="number"
                    placeholder="Number of Eggs"
                    value={broodyEditForm.egg_count}
                    onChange={(e) =>
                      setBroodyEditForm({ ...broodyEditForm, egg_count: e.target.value })
                    }
                  />

                  <select
                    className="border p-2"
                    value={broodyEditForm.egg_type}
                    onChange={(e) =>
                      setBroodyEditForm({ ...broodyEditForm, egg_type: e.target.value })
                    }
                  >
                    <option value="real">Real Eggs</option>
                    <option value="fake">Fake Eggs</option>
                    <option value="mixed">Real and Fake Eggs</option>
                    <option value="unknown">Unknown</option>
                  </select>

                  <input
                    className="border p-2"
                    type="number"
                    placeholder="Live Chicks Hatched"
                    value={broodyEditForm.live_chicks_hatched}
                    onChange={(e) =>
                      setBroodyEditForm({
                        ...broodyEditForm,
                        live_chicks_hatched: e.target.value,
                      })
                    }
                  />

                  <input
                    className="border p-2"
                    type="number"
                    placeholder="Chicks Given"
                    value={broodyEditForm.chicks_given}
                    onChange={(e) =>
                      setBroodyEditForm({ ...broodyEditForm, chicks_given: e.target.value })
                    }
                  />

                  <input
                    className="border p-2"
                    type="number"
                    placeholder="Chicks Accepted"
                    value={broodyEditForm.chicks_accepted}
                    onChange={(e) =>
                      setBroodyEditForm({ ...broodyEditForm, chicks_accepted: e.target.value })
                    }
                  />

                  <select
                    className="border p-2"
                    value={broodyEditForm.status}
                    onChange={(e) =>
                      setBroodyEditForm({ ...broodyEditForm, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="hatched">Hatched</option>
                    <option value="adoption">Adoption Attempt</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <textarea
                    className="border p-2 sm:col-span-2"
                    placeholder="Notes"
                    value={broodyEditForm.notes}
                    onChange={(e) =>
                      setBroodyEditForm({ ...broodyEditForm, notes: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold">
                      {getAnimalDisplayName(record.hen)}
                    </h3>

                    <span className="rounded-full bg-[#f4ead7] px-3 py-1 text-sm capitalize">
                      {record.status || 'active'}
                    </span>
                  </div>

                  <p>Started Sitting: {record.started_sitting_date || 'Not set'}</p>
                  <p>Days Sitting: {getDaysSitting(record.started_sitting_date)}</p>
                  <p>Expected Hatch: {getExpectedHatchDate(record.started_sitting_date)}</p>
                  <p>Eggs: {record.egg_count || 0} ({record.egg_type || 'unknown'})</p>
                  <p>Live Chicks Hatched: {record.live_chicks_hatched || 0}</p>
                  <p>Chicks Given: {record.chicks_given || 0}</p>
                  <p>Chicks Accepted: {record.chicks_accepted || 0}</p>
                  <p>Notes: {record.notes || 'None'}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => deleteBroodyRecord(record.id)}
                >
                  Delete
                </button>

                {editingBroodyId === record.id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() => updateBroodyRecord(record.id)}
                    >
                      Save
                    </button>

                    <button
                      className="border px-3 py-1 rounded"
                      onClick={() => setEditingBroodyId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setEditingBroodyId(record.id)
                      setBroodyEditForm({
                        hen_animal_id: record.hen_animal_id || '',
                        started_sitting_date: record.started_sitting_date || '',
                        egg_count: record.egg_count?.toString() || '',
                        egg_type: record.egg_type || 'real',
                        live_chicks_hatched: record.live_chicks_hatched?.toString() || '',
                        chicks_given: record.chicks_given?.toString() || '',
                        chicks_accepted: record.chicks_accepted?.toString() || '',
                        status: record.status || 'active',
                        notes: record.notes || '',
                      })
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}