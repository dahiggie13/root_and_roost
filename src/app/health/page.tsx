'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Filter } from 'lucide-react'

const supabase = createClient()

export default function HealthPage() {
  const [userId, setUserId] = useState('')
  const [records, setRecords] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRecordType, setFilterRecordType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)

const [editForm, setEditForm] = useState({
  animal_id: '',
  record_type: 'checkup',
  record_date: '',
  treatment: '',
  provider: '',
  cost: '',
  notes: '',
})

  const [showForm, setShowForm] = useState(false)
  const [animalId, setAnimalId] = useState('')
  const [recordType, setRecordType] = useState('checkup')
  const [recordDate, setRecordDate] = useState('')
  const [treatment, setTreatment] = useState('')
  const [provider, setProvider] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')

  async function fetchRecords(currentUserId = userId) {
    if (!currentUserId) return

    const { data, error } = await supabase
      .from('health_records')
      .select(`
        *,
        animals (
          id,
          name,
          animal_type,
          animal_subtype,
          band_number
        )
      `)
      .eq('user_id', currentUserId)
      .order('record_date', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setRecords(data || [])
  }

  async function fetchAnimals(currentUserId = userId) {
    if (!currentUserId) return

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

  async function addRecord() {
    if (!recordDate) {
      alert('Please select a record date')
      return
    }

    const { error } = await supabase
      .from('health_records')
      .insert([
        {
          user_id: userId,
          animal_id: animalId || null,
          record_type: recordType,
          record_date: recordDate,
          treatment,
          provider,
          cost: cost ? Number(cost) : 0,
          notes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setAnimalId('')
    setRecordType('checkup')
    setRecordDate('')
    setTreatment('')
    setProvider('')
    setCost('')
    setNotes('')
    setShowForm(false)

    fetchRecords()
  }

  async function deleteRecord(id: string) {
    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchRecords()
  }

async function updateRecord(id: string) {
  const { error } = await supabase
    .from('health_records')
    .update({
      animal_id: editForm.animal_id || null,
      record_type: editForm.record_type,
      record_date: editForm.record_date || null,
      treatment: editForm.treatment,
      provider: editForm.provider,
      cost: editForm.cost ? Number(editForm.cost) : 0,
      notes: editForm.notes,
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.log(error)
    alert(error.message)
    return
  }

  setEditingId(null)
  fetchRecords()
}

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchRecords(data.user.id)
      fetchAnimals(data.user.id)
    }

    loadUserData()
  }, [])

  function getAnimalDisplayName(animal: any) {
    if (!animal) return 'No animal linked'
    if (animal.name) return animal.name
    if (animal.band_number) return `Band ${animal.band_number}`
    if (animal.animal_type === 'poultry' && animal.animal_subtype) {
      return `Unnamed ${animal.animal_subtype}`
    }
    if (animal.animal_type) return `Unnamed ${animal.animal_type}`
    return 'Unnamed Animal'
  }

  const totalCost = records.reduce((sum, record) => {
    return sum + Number(record.cost || 0)
  }, 0)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Health Records
      </h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <p className="text-gray-600">
          Total Health Costs
        </p>

        <p className="text-3xl font-bold">
          ${totalCost.toFixed(2)}
        </p>
      </div>

      <button
        className="bg-black text-white px-4 py-2 rounded mb-6"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Close Form' : '+ Add Health Record'}
      </button>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            Add Health Record
          </h2>

          <select
            className="border p-2 w-full mb-3"
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
          >
            <option value="">No Animal Linked</option>

            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {getAnimalDisplayName(animal)} - {animal.animal_type}
              </option>
            ))}
          </select>

          <select
            className="border p-2 w-full mb-3"
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
          >
            <option value="checkup">Checkup</option>
            <option value="illness">Illness</option>
            <option value="injury">Injury</option>
            <option value="vaccination">Vaccination</option>
            <option value="deworming">Deworming</option>
            <option value="hoof_trim">Hoof Trim</option>
            <option value="medication">Medication</option>
            <option value="other">Other</option>
          </select>

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Record Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </div>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Treatment"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Provider / Vet"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            type="number"
            step="0.01"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addRecord}
          >
            Add Health Record
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 w-full"
          placeholder="Search health records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          type="button"
          className="bg-black text-white p-2 rounded"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filter health records"
        >
          <Filter size={22} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-3 rounded-xl shadow mb-4">
          <select
            className="border p-2 w-full mb-3"
            value={filterRecordType}
            onChange={(e) => setFilterRecordType(e.target.value)}
          >
            <option value="all">All Record Types</option>
            <option value="checkup">Checkup</option>
            <option value="illness">Illness</option>
            <option value="injury">Injury</option>
            <option value="vaccination">Vaccination</option>
            <option value="deworming">Deworming</option>
            <option value="hoof_trim">Hoof Trim</option>
            <option value="medication">Medication</option>
            <option value="other">Other</option>
          </select>

          <button
            type="button"
            className="border px-3 py-2 rounded"
            onClick={() => setFilterRecordType('all')}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {records
          .filter((record) => {
            const search = searchTerm.toLowerCase()
            const animalName = getAnimalDisplayName(record.animals).toLowerCase()

            const matchesSearch =
              search === '' ||
              record.record_type?.toLowerCase().includes(search) ||
              record.treatment?.toLowerCase().includes(search) ||
              record.provider?.toLowerCase().includes(search) ||
              record.notes?.toLowerCase().includes(search) ||
              animalName.includes(search)

            const matchesRecordType =
              filterRecordType === 'all' || record.record_type === filterRecordType

            return matchesSearch && matchesRecordType
          })
          .map((record) => (
          <div
            key={record.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            {editingId === record.id ? (
  <div className="grid gap-2">
    <select
      className="border p-2"
      value={editForm.animal_id}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          animal_id: e.target.value,
        })
      }
    >
      <option value="">No Animal Linked</option>

      {animals.map((animal) => (
        <option key={animal.id} value={animal.id}>
          {getAnimalDisplayName(animal)} - {animal.animal_type}
        </option>
      ))}
    </select>

    <select
      className="border p-2"
      value={editForm.record_type}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          record_type: e.target.value,
        })
      }
    >
      <option value="checkup">Checkup</option>
      <option value="illness">Illness</option>
      <option value="injury">Injury</option>
      <option value="vaccination">Vaccination</option>
      <option value="deworming">Deworming</option>
      <option value="hoof_trim">Hoof Trim</option>
      <option value="medication">Medication</option>
      <option value="other">Other</option>
    </select>

    <div>
      <label className="block font-medium mb-1">
        Record Date
      </label>

      <input
        className="border p-2 w-full"
        type="date"
        value={editForm.record_date}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            record_date: e.target.value,
          })
        }
      />
    </div>

    <input
      className="border p-2"
      placeholder="Treatment"
      value={editForm.treatment}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          treatment: e.target.value,
        })
      }
    />

    <input
      className="border p-2"
      placeholder="Provider / Vet"
      value={editForm.provider}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          provider: e.target.value,
        })
      }
    />

    <input
      className="border p-2"
      type="number"
      step="0.01"
      placeholder="Cost"
      value={editForm.cost}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          cost: e.target.value,
        })
      }
    />

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
      {record.record_type}
    </h2>

    <p>Animal: {getAnimalDisplayName(record.animals)}</p>
    <p>Date: {record.record_date || 'Not set'}</p>
    <p>Treatment: {record.treatment || 'None'}</p>
    <p>Provider: {record.provider || 'None'}</p>
    <p>Cost: ${Number(record.cost || 0).toFixed(2)}</p>
    <p>Notes: {record.notes || 'None'}</p>
  </div>
)}

{editingId === record.id ? (
  <>
  <button
    className="bg-green-500 text-white px-3 py-1 rounded mt-3 ml-2"
    onClick={() => updateRecord(record.id)}
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
      setEditingId(record.id)

      setEditForm({
        animal_id: record.animal_id || '',
        record_type: record.record_type || 'checkup',
        record_date: record.record_date || '',
        treatment: record.treatment || '',
        provider: record.provider || '',
        cost: record.cost?.toString() || '',
        notes: record.notes || '',
      })
    }}
  >
    Edit
  </button>
)}

            <button
              className="bg-red-500 text-white px-3 py-1 rounded mt-3"
              onClick={() => deleteRecord(record.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
