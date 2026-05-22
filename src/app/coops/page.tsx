'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()



export default function CoopsPage() {
  const [coops, setCoops] = useState<any[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [locationType, setLocationType] = useState('coop')
const [editingId, setEditingId] = useState<string | null>(null)
const [userId, setUserId] = useState('')
const [editForm, setEditForm] = useState({
  name: '',
  location_type: 'coop',
  location: '',
  description: '',
})

  async function fetchCoops(currentUserId = userId) {
    if (!currentUserId) {
      setCoops([])
      return
    }

    const { data, error } = await supabase
      .from('coops')
      .select(`
  *,
  animals (
    id
  )
`)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
    } else {
      setCoops(data)
    }
  }

  async function addCoop() {
    if (!name) {
      alert('Please enter a coop or pasture name')
      return
    }

    const { error } = await supabase
      .from('coops')
      .insert([
        {
          user_id: userId,
          name,
          location_type: locationType,
          description,
          location,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
    } else {
      setName('')
      setLocationType('coop')
      setDescription('')
      setLocation('')
      fetchCoops()
    }
  }

  async function deleteCoop(id: string) {
    const { error } = await supabase
      .from('coops')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      alert(error.message)
    } else {
      fetchCoops()
    }
  }

  async function updateCoop(id: string) {
  const { error } = await supabase
    .from('coops')
    .update({
      name: editForm.name,
      location_type: editForm.location_type,
      location: editForm.location,
      description: editForm.description,
    })
    .eq('id', id)

  if (error) {
    console.log(error)
    alert(error.message)
  } else {
    setEditingId(null)
    fetchCoops()
  }
}

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchCoops(data.user.id)
    }

    loadUserData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Coops / Pastures</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Add Coop / Pasture</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Coop or Pasture Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-3"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
        >
          <option value="coop">Coop</option>
          <option value="brooder">Brooder</option>
          <option value="pasture">Pasture</option>
          <option value="stall">Stall</option>
          <option value="hive_yard">Hive Yard</option>
          <option value="garden_area">Garden Area</option>
          <option value="other">Other</option>
        </select>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Location Description"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={addCoop}
        >
          Add Coop / Pasture
        </button>
      </div>

      <div className="grid gap-4">
       {coops.map((coop) => (

  <div
    key={coop.id}
    className="bg-white p-4 rounded-xl shadow"
  >

    {editingId === coop.id ? (

      <div className="grid gap-2">

        <input
          className="border p-2"
          placeholder="Coop or Pasture Name"
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
          value={editForm.location_type}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              location_type: e.target.value,
            })
          }
        >
          <option value="coop">Coop</option>
          <option value="brooder">Brooder</option>
          <option value="pasture">Pasture</option>
          <option value="stall">Stall</option>
          <option value="hive_yard">Hive Yard</option>
          <option value="garden_area">Garden Area</option>
          <option value="other">Other</option>
        </select>

        <input
          className="border p-2"
          placeholder="Location Description"
          value={editForm.location}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              location: e.target.value,
            })
          }
        />

        <textarea
          className="border p-2"
          placeholder="Description"
          value={editForm.description}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              description: e.target.value,
            })
          }
        />

        <button
          className="bg-green-500 text-white px-3 py-1 rounded mt-3"
          onClick={() => updateCoop(coop.id)}
        >
          Save
        </button>

        <button
          className="border px-3 py-1 rounded mt-3 ml-2"
          onClick={() => setEditingId(null)}
        >
          Cancel
        </button>

      </div>

    ) : (

      <div>

        <h2 className="text-xl font-bold">
          {coop.name}
        </h2>

        <p>Location: {coop.location}</p>

        <p>Type: {getLocationTypeLabel(coop.location_type)}</p>

        <p>Description: {coop.description}</p>

        <p>
          Animals Assigned: {coop.animals?.length || 0}
        </p>

        <button
          className="bg-red-500 text-white px-3 py-1 rounded mt-3"
          onClick={() => deleteCoop(coop.id)}
        >
          Delete
        </button>
<Link
  href={`/coops/${coop.id}`}
  className="bg-black text-white px-3 py-1 rounded mt-3 inline-block"
>
  View
</Link>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded mt-3 ml-2"
          onClick={() => {

            setEditingId(coop.id)

            setEditForm({
              name: coop.name || '',
              location_type: coop.location_type || 'coop',
              location: coop.location || '',
              description: coop.description || '',
            })

          }}
        >
          Edit
        </button>

      </div>

    )}

  </div>

))}
      </div>
    </div>
  )
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
