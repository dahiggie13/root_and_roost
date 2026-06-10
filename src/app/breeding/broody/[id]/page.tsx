'use client'

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

type Animal = {
  id: string
  name: string | null
  animal_type: string | null
  animal_subtype: string | null
  breed: string | null
  band_number: string | null
}

type BroodyRecord = {
  id: string
  hen_animal_id: string | null
  started_sitting_date: string | null
  ended_sitting_date: string | null
  egg_count: number | null
  egg_type: string | null
  live_chicks_hatched: number | null
  chicks_given: number | null
  chicks_accepted: number | null
  status: string | null
  notes: string | null
  hen?: Animal | null
}

export default function BroodyDetailPage() {
  const params = useParams()
  const broodyId = params.id as string

  const [userId, setUserId] = useState('')
  const [record, setRecord] = useState<BroodyRecord | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchRecord(currentUserId = userId) {
    if (!currentUserId || !broodyId) return

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
          band_number
        )
      `)
      .eq('id', broodyId)
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.log(error)
      setRecord(null)
      return
    }

    setRecord(data)
  }

  useEffect(() => {
    async function loadRecord() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setLoading(false)
        return
      }

      setUserId(data.user.id)
      await fetchRecord(data.user.id)
      setLoading(false)
    }

    loadRecord()
  }, [broodyId])

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

  function getDaysSitting(startDate: string | null, endDate: string | null) {
    if (!startDate) return 'Unknown'

    const start = new Date(`${startDate}T00:00:00`)
    const end = endDate ? new Date(`${endDate}T00:00:00`) : new Date()
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    const difference = endDay.getTime() - startDay.getTime()

    return Math.max(0, Math.floor(difference / 86400000)).toString()
  }

  function getExpectedHatchDate(startDate: string | null) {
    if (!startDate) return 'Unknown'

    const hatchDate = new Date(`${startDate}T00:00:00`)
    hatchDate.setDate(hatchDate.getDate() + 21)

    return hatchDate.toISOString().split('T')[0]
  }

  if (loading) {
    return <p>Loading broody hen record...</p>
  }

  if (!record) {
    return (
      <div>
        <Link href="/breeding" className="text-blue-600 underline">
          Back to Breeding
        </Link>

        <p className="mt-4">
          Broody hen record not found.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/breeding" className="text-blue-600 underline">
        Back to Breeding
      </Link>

      <div className="bg-white p-4 rounded-xl shadow mt-4 mb-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold">
            {getAnimalDisplayName(record.hen)}
          </h1>

          <span className="rounded-full bg-[#f4ead7] px-3 py-1 text-sm capitalize">
            {record.status || 'active'}
          </span>
        </div>

        <p>Started Sitting: {record.started_sitting_date || 'Not set'}</p>
        <p>Ended Sitting: {record.ended_sitting_date || 'Still sitting'}</p>
        <p>Days Sitting: {getDaysSitting(record.started_sitting_date, record.ended_sitting_date)}</p>
        <p>Expected Hatch: {getExpectedHatchDate(record.started_sitting_date)}</p>
        <p>Eggs: {record.egg_count || 0}</p>
        <p>Egg Type: {record.egg_type || 'Unknown'}</p>
        <p>Live Chicks Hatched: {record.live_chicks_hatched || 0}</p>
        <p>Chicks Given: {record.chicks_given || 0}</p>
        <p>Chicks Accepted: {record.chicks_accepted || 0}</p>
        <p>Notes: {record.notes || 'None'}</p>
      </div>
    </div>
  )
}