'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Filter } from 'lucide-react'

const supabase = createClient()

export default function GardenPage() {
  const [userId, setUserId] = useState('')
  const [beds, setBeds] = useState<any[]>([])
  const [crops, setCrops] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterSection, setFilterSection] = useState('all')
  const [filterCropStatus, setFilterCropStatus] = useState('all')
  const [filterBedId, setFilterBedId] = useState('all')

  const [showBedForm, setShowBedForm] = useState(false)
  const [showCropForm, setShowCropForm] = useState(false)

  const [bedName, setBedName] = useState('')
  const [bedLocation, setBedLocation] = useState('')
  const [bedSize, setBedSize] = useState('')
  const [bedNotes, setBedNotes] = useState('')

  const [gardenBedId, setGardenBedId] = useState('')
  const [cropName, setCropName] = useState('')
  const [variety, setVariety] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('')
  const [actualHarvestDate, setActualHarvestDate] = useState('')
  const [status, setStatus] = useState('planted')
  const [cropNotes, setCropNotes] = useState('')

  const [editingBedId, setEditingBedId] = useState<string | null>(null)
  const [editingCropId, setEditingCropId] = useState<string | null>(null)

  const [bedEditForm, setBedEditForm] = useState({
    name: '',
    location: '',
    size: '',
    notes: '',
  })

  const [cropEditForm, setCropEditForm] = useState({
    garden_bed_id: '',
    crop_name: '',
    variety: '',
    planting_date: '',
    expected_harvest_date: '',
    actual_harvest_date: '',
    status: 'planted',
    notes: '',
  })

  async function fetchBeds(currentUserId = userId) {
    if (!currentUserId) return

    const { data, error } = await supabase
      .from('garden_beds')
      .select('*')
      .eq('user_id', currentUserId)
      .order('name')

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setBeds(data || [])
  }

  async function fetchCrops(currentUserId = userId) {
    if (!currentUserId) return

    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        garden_beds (
          id,
          name
        )
      `)
      .eq('user_id', currentUserId)
      .order('planting_date', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setCrops(data || [])
  }

  async function addBed() {
    if (!bedName) {
      alert('Please enter a bed name')
      return
    }

    const { error } = await supabase
      .from('garden_beds')
      .insert([
        {
          user_id: userId,
          name: bedName,
          location: bedLocation,
          size: bedSize,
          notes: bedNotes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setBedName('')
    setBedLocation('')
    setBedSize('')
    setBedNotes('')
    setShowBedForm(false)

    fetchBeds()
  }

  async function addCrop() {
    if (!cropName) {
      alert('Please enter a crop name')
      return
    }

    const { error } = await supabase
      .from('crops')
      .insert([
        {
          user_id: userId,
          garden_bed_id: gardenBedId || null,
          crop_name: cropName,
          variety,
          planting_date: plantingDate || null,
          expected_harvest_date: expectedHarvestDate || null,
          actual_harvest_date: actualHarvestDate || null,
          status,
          notes: cropNotes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setGardenBedId('')
    setCropName('')
    setVariety('')
    setPlantingDate('')
    setExpectedHarvestDate('')
    setActualHarvestDate('')
    setStatus('planted')
    setCropNotes('')
    setShowCropForm(false)

    fetchCrops()
  }

  async function deleteBed(id: string) {
    const { error } = await supabase
      .from('garden_beds')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchBeds()
    fetchCrops()
  }

  async function updateBed(id: string) {
    const { error } = await supabase
      .from('garden_beds')
      .update({
        name: bedEditForm.name,
        location: bedEditForm.location,
        size: bedEditForm.size,
        notes: bedEditForm.notes,
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setEditingBedId(null)
    fetchBeds()
  }

  async function deleteCrop(id: string) {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchCrops()
  }

  async function updateCrop(id: string) {
    const { error } = await supabase
      .from('crops')
      .update({
        garden_bed_id: cropEditForm.garden_bed_id || null,
        crop_name: cropEditForm.crop_name,
        variety: cropEditForm.variety,
        planting_date: cropEditForm.planting_date || null,
        expected_harvest_date: cropEditForm.expected_harvest_date || null,
        actual_harvest_date: cropEditForm.actual_harvest_date || null,
        status: cropEditForm.status,
        notes: cropEditForm.notes,
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setEditingCropId(null)
    fetchCrops()
  }

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchBeds(data.user.id)
      fetchCrops(data.user.id)
    }

    loadUserData()
  }, [])

  const filteredBeds = beds.filter((bed) => {
    const search = searchTerm.toLowerCase()

    return (
      search === '' ||
      bed.name?.toLowerCase().includes(search) ||
      bed.location?.toLowerCase().includes(search) ||
      bed.size?.toLowerCase().includes(search) ||
      bed.notes?.toLowerCase().includes(search)
    )
  })

  const filteredCrops = crops.filter((crop) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      search === '' ||
      crop.crop_name?.toLowerCase().includes(search) ||
      crop.variety?.toLowerCase().includes(search) ||
      crop.status?.toLowerCase().includes(search) ||
      crop.notes?.toLowerCase().includes(search) ||
      crop.garden_beds?.name?.toLowerCase().includes(search)

    const matchesStatus =
      filterCropStatus === 'all' || crop.status === filterCropStatus

    const matchesBed =
      filterBedId === 'all' ||
      (filterBedId === 'none' && !crop.garden_bed_id) ||
      crop.garden_bed_id === filterBedId

    return matchesSearch && matchesStatus && matchesBed
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Garden
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-600">
            Garden Beds
          </p>

          <p className="text-3xl font-bold">
            {beds.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-600">
            Crops
          </p>

          <p className="text-3xl font-bold">
            {crops.length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => setShowBedForm(!showBedForm)}
        >
          {showBedForm ? 'Close Bed Form' : '+ Add Garden Bed'}
        </button>

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => setShowCropForm(!showCropForm)}
        >
          {showCropForm ? 'Close Crop Form' : '+ Add Crop'}
        </button>
      </div>

      {showBedForm && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            Add Garden Bed
          </h2>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Bed Name"
            value={bedName}
            onChange={(e) => setBedName(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Location"
            value={bedLocation}
            onChange={(e) => setBedLocation(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Size"
            value={bedSize}
            onChange={(e) => setBedSize(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes"
            value={bedNotes}
            onChange={(e) => setBedNotes(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addBed}
          >
            Add Bed
          </button>
        </div>
      )}

      {showCropForm && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            Add Crop
          </h2>

          <select
            className="border p-2 w-full mb-3"
            value={gardenBedId}
            onChange={(e) => setGardenBedId(e.target.value)}
          >
            <option value="">No Bed Assigned</option>

            {beds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                {bed.name}
              </option>
            ))}
          </select>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Crop Name"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Variety"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
          />

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Planting Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Expected Harvest Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={expectedHarvestDate}
              onChange={(e) => setExpectedHarvestDate(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Actual Harvest Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={actualHarvestDate}
              onChange={(e) => setActualHarvestDate(e.target.value)}
            />
          </div>

          <select
            className="border p-2 w-full mb-3"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="planned">Planned</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="harvested">Harvested</option>
            <option value="failed">Failed</option>
          </select>

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes"
            value={cropNotes}
            onChange={(e) => setCropNotes(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addCrop}
          >
            Add Crop
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 w-full"
          placeholder="Search garden..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          type="button"
          className="bg-black text-white p-2 rounded"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filter garden"
        >
          <Filter size={22} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-3 rounded-xl shadow mb-4">
          <select
            className="border p-2 w-full mb-3"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          >
            <option value="all">Beds and Crops</option>
            <option value="beds">Garden Beds Only</option>
            <option value="crops">Crops Only</option>
          </select>

          <select
            className="border p-2 w-full mb-3"
            value={filterCropStatus}
            onChange={(e) => setFilterCropStatus(e.target.value)}
          >
            <option value="all">All Crop Statuses</option>
            <option value="planned">Planned</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="harvested">Harvested</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="border p-2 w-full mb-3"
            value={filterBedId}
            onChange={(e) => setFilterBedId(e.target.value)}
          >
            <option value="all">All Garden Beds</option>
            <option value="none">No Bed Assigned</option>

            {beds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                {bed.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="border px-3 py-2 rounded"
            onClick={() => {
              setFilterSection('all')
              setFilterCropStatus('all')
              setFilterBedId('all')
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {filterSection !== 'crops' && (
        <>
          <h2 className="text-2xl font-bold mb-4">
            Garden Beds
          </h2>

          <div className="grid gap-4 mb-6">
        {filteredBeds.map((bed) => (
          <div
            key={bed.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            {editingBedId === bed.id ? (
              <div className="grid gap-2">
                <input
                  className="border p-2"
                  placeholder="Bed Name"
                  value={bedEditForm.name}
                  onChange={(e) =>
                    setBedEditForm({
                      ...bedEditForm,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  className="border p-2"
                  placeholder="Location"
                  value={bedEditForm.location}
                  onChange={(e) =>
                    setBedEditForm({
                      ...bedEditForm,
                      location: e.target.value,
                    })
                  }
                />

                <input
                  className="border p-2"
                  placeholder="Size"
                  value={bedEditForm.size}
                  onChange={(e) =>
                    setBedEditForm({
                      ...bedEditForm,
                      size: e.target.value,
                    })
                  }
                />

                <textarea
                  className="border p-2"
                  placeholder="Notes"
                  value={bedEditForm.notes}
                  onChange={(e) =>
                    setBedEditForm({
                      ...bedEditForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">
                  {bed.name}
                </h3>

                <p>Location: {bed.location || 'None'}</p>
                <p>Size: {bed.size || 'Unknown'}</p>
              </div>
            )}

            <button
              className="bg-red-500 text-white px-3 py-1 rounded mt-3"
              onClick={() => deleteBed(bed.id)}
            >
              Delete
            </button>

            {editingBedId === bed.id ? (
              <>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded mt-3 ml-2"
                onClick={() => updateBed(bed.id)}
              >
                Save
              </button>

              <button
                className="border px-3 py-1 rounded mt-3 ml-2"
                onClick={() => setEditingBedId(null)}
              >
                Cancel
              </button>
              </>
            ) : (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded mt-3 ml-2"
                onClick={() => {
                  setEditingBedId(bed.id)
                  setBedEditForm({
                    name: bed.name || '',
                    location: bed.location || '',
                    size: bed.size || '',
                    notes: bed.notes || '',
                  })
                }}
              >
                Edit
              </button>
            )}

            <Link
              href={`/garden/beds/${bed.id}`}
              className="bg-black text-white px-3 py-1 rounded mt-3 ml-2 inline-block"
            >
              View
            </Link>
          </div>
        ))}
          </div>
        </>
      )}

      {filterSection !== 'beds' && (
        <>
          <h2 className="text-2xl font-bold mb-4">
            Crops
          </h2>

          <div className="grid gap-4">
        {filteredCrops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            {editingCropId === crop.id ? (
              <div className="grid gap-2">
                <select
                  className="border p-2"
                  value={cropEditForm.garden_bed_id}
                  onChange={(e) =>
                    setCropEditForm({
                      ...cropEditForm,
                      garden_bed_id: e.target.value,
                    })
                  }
                >
                  <option value="">No Bed Assigned</option>

                  {beds.map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      {bed.name}
                    </option>
                  ))}
                </select>

                <input
                  className="border p-2"
                  placeholder="Crop Name"
                  value={cropEditForm.crop_name}
                  onChange={(e) =>
                    setCropEditForm({
                      ...cropEditForm,
                      crop_name: e.target.value,
                    })
                  }
                />

                <input
                  className="border p-2"
                  placeholder="Variety"
                  value={cropEditForm.variety}
                  onChange={(e) =>
                    setCropEditForm({
                      ...cropEditForm,
                      variety: e.target.value,
                    })
                  }
                />

                <div>
                  <label className="block font-medium mb-1">
                    Planting Date
                  </label>

                  <input
                    className="border p-2 w-full"
                    type="date"
                    value={cropEditForm.planting_date}
                    onChange={(e) =>
                      setCropEditForm({
                        ...cropEditForm,
                        planting_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Expected Harvest Date
                  </label>

                  <input
                    className="border p-2 w-full"
                    type="date"
                    value={cropEditForm.expected_harvest_date}
                    onChange={(e) =>
                      setCropEditForm({
                        ...cropEditForm,
                        expected_harvest_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Actual Harvest Date
                  </label>

                  <input
                    className="border p-2 w-full"
                    type="date"
                    value={cropEditForm.actual_harvest_date}
                    onChange={(e) =>
                      setCropEditForm({
                        ...cropEditForm,
                        actual_harvest_date: e.target.value,
                      })
                    }
                  />
                </div>

                <select
                  className="border p-2"
                  value={cropEditForm.status}
                  onChange={(e) =>
                    setCropEditForm({
                      ...cropEditForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="planned">Planned</option>
                  <option value="planted">Planted</option>
                  <option value="growing">Growing</option>
                  <option value="harvested">Harvested</option>
                  <option value="failed">Failed</option>
                </select>

                <textarea
                  className="border p-2"
                  placeholder="Notes"
                  value={cropEditForm.notes}
                  onChange={(e) =>
                    setCropEditForm({
                      ...cropEditForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">
                  {crop.crop_name}
                </h3>

                <p>Variety: {crop.variety || 'Unknown'}</p>
                <p>Bed: {crop.garden_beds?.name || 'Not assigned'}</p>
                <p>Status: {crop.status}</p>
              </div>
            )}

            <button
              className="bg-red-500 text-white px-3 py-1 rounded mt-3"
              onClick={() => deleteCrop(crop.id)}
            >
              Delete
            </button>

            {editingCropId === crop.id ? (
              <>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded mt-3 ml-2"
                onClick={() => updateCrop(crop.id)}
              >
                Save
              </button>

              <button
                className="border px-3 py-1 rounded mt-3 ml-2"
                onClick={() => setEditingCropId(null)}
              >
                Cancel
              </button>
              </>
            ) : (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded mt-3 ml-2"
                onClick={() => {
                  setEditingCropId(crop.id)
                  setCropEditForm({
                    garden_bed_id: crop.garden_bed_id || '',
                    crop_name: crop.crop_name || '',
                    variety: crop.variety || '',
                    planting_date: crop.planting_date || '',
                    expected_harvest_date: crop.expected_harvest_date || '',
                    actual_harvest_date: crop.actual_harvest_date || '',
                    status: crop.status || 'planted',
                    notes: crop.notes || '',
                  })
                }}
              >
                Edit
              </button>
            )}

            <Link
              href={`/garden/crops/${crop.id}`}
              className="bg-black text-white px-3 py-1 rounded mt-3 ml-2 inline-block"
            >
              View
            </Link>
          </div>
        ))}
          </div>
        </>
      )}
    </div>
  )
}
