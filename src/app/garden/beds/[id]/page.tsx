'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function GardenBedDetailPage() {
  const params = useParams()
  const bedId = params.id as string

  const [userId, setUserId] = useState('')
  const [bed, setBed] = useState<any>(null)
  const [crops, setCrops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchBed(currentUserId = userId) {
    if (!currentUserId || !bedId) return

    const { data, error } = await supabase
      .from('garden_beds')
      .select('*')
      .eq('id', bedId)
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.log(error)
      setBed(null)
      return
    }

    setBed(data)
  }

  async function fetchCrops(currentUserId = userId) {
    if (!currentUserId || !bedId) return

    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('garden_bed_id', bedId)
      .eq('user_id', currentUserId)
      .order('planting_date', { ascending: false })

    if (error) {
      console.log(error)
      setCrops([])
      return
    }

    setCrops(data || [])
  }

  useEffect(() => {
    async function loadBedData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setLoading(false)
        return
      }

      setUserId(data.user.id)
      await fetchBed(data.user.id)
      await fetchCrops(data.user.id)
      setLoading(false)
    }

    loadBedData()
  }, [bedId])

  if (loading) {
    return <p>Loading garden bed...</p>
  }

  if (!bed) {
    return (
      <div>
        <Link href="/garden" className="text-blue-600 underline">
          Back to Garden
        </Link>

        <p className="mt-4">Garden bed not found.</p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/garden" className="text-blue-600 underline">
        Back to Garden
      </Link>

      <div className="bg-white p-4 rounded-xl shadow mt-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {bed.name}
        </h1>

        <p>Location: {bed.location || 'None'}</p>
        <p>Size: {bed.size || 'Unknown'}</p>
        <p>Notes: {bed.notes || 'None'}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Bed Summary
        </h2>

        <p>Crops in this bed: {crops.length}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Crops
      </h2>

      <div className="grid gap-4">
        {crops.length === 0 ? (
          <p>No crops assigned to this bed yet.</p>
        ) : (
          crops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <h3 className="text-xl font-bold">
                {crop.crop_name}
              </h3>

              <p>Variety: {crop.variety || 'Unknown'}</p>
              <p>Status: {crop.status || 'Unknown'}</p>
              <p>Planted: {crop.planting_date || 'Not set'}</p>
              <p>Expected Harvest: {crop.expected_harvest_date || 'Not set'}</p>

              <Link
                href={`/garden/crops/${crop.id}`}
                className="bg-black text-white px-3 py-1 rounded mt-3 inline-block"
              >
                View Crop
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
