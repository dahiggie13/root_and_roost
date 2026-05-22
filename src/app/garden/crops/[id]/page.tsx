'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function CropDetailPage() {
  const params = useParams()
  const cropId = params.id as string

  const [userId, setUserId] = useState('')
  const [crop, setCrop] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function fetchCrop(currentUserId = userId) {
    if (!currentUserId || !cropId) return

    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        garden_beds (
          id,
          name,
          location
        )
      `)
      .eq('id', cropId)
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.log(error)
      setCrop(null)
      return
    }

    setCrop(data)
  }

  useEffect(() => {
    async function loadCropData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setLoading(false)
        return
      }

      setUserId(data.user.id)
      await fetchCrop(data.user.id)
      setLoading(false)
    }

    loadCropData()
  }, [cropId])

  if (loading) {
    return <p>Loading crop...</p>
  }

  if (!crop) {
    return (
      <div>
        <Link href="/garden" className="text-blue-600 underline">
          Back to Garden
        </Link>

        <p className="mt-4">Crop not found.</p>
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
          {crop.crop_name}
        </h1>

        <p>Variety: {crop.variety || 'Unknown'}</p>
        <p>Status: {crop.status || 'Unknown'}</p>
        <p>
          Bed:{' '}
          {crop.garden_beds ? (
            <Link href={`/garden/beds/${crop.garden_beds.id}`} className="text-blue-600 underline">
              {crop.garden_beds.name}
            </Link>
          ) : (
            'Not assigned'
          )}
        </p>
        <p>Planting Date: {crop.planting_date || 'Not set'}</p>
        <p>Expected Harvest: {crop.expected_harvest_date || 'Not set'}</p>
        <p>Actual Harvest: {crop.actual_harvest_date || 'Not set'}</p>
        <p>Notes: {crop.notes || 'None'}</p>
      </div>
    </div>
  )
}
