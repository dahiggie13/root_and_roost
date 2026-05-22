'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function BreedingDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [userId, setUserId] = useState('')
  const [project, setProject] = useState<any>(null)
  const [youngStock, setYoungStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchProject(currentUserId = userId) {
    if (!currentUserId || !projectId) return

    const { data, error } = await supabase
      .from('breeding_projects')
      .select(`
        *,
        male:male_animal_id (
          id,
          name,
          animal_type,
          animal_subtype,
          breed,
          band_number
        ),
        female:female_animal_id (
          id,
          name,
          animal_type,
          animal_subtype,
          breed,
          band_number
        )
      `)
      .eq('id', projectId)
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.log(error)
      setProject(null)
      return
    }

    setProject(data)
  }

  async function fetchYoungStock(currentUserId = userId) {
    if (!currentUserId || !projectId) return

    const { data, error } = await supabase
      .from('chicks')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('breeding_project_id', projectId)
      .order('hatch_date', { ascending: false })

    if (error) {
      console.log(error)
      setYoungStock([])
      return
    }

    setYoungStock(data || [])
  }

  useEffect(() => {
    async function loadProjectData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setLoading(false)
        return
      }

      setUserId(data.user.id)

      await fetchProject(data.user.id)
      await fetchYoungStock(data.user.id)

      setLoading(false)
    }

    loadProjectData()
  }, [projectId])

  function getAnimalDisplayName(animal: any) {
    if (!animal) return 'Not selected'

    if (animal.name) return animal.name

    if (animal.band_number) return `Band ${animal.band_number}`

    if (animal.animal_type === 'poultry' && animal.animal_subtype) {
      return `Unnamed ${animal.animal_subtype}`
    }

    if (animal.animal_type) return `Unnamed ${animal.animal_type}`

    return 'Unnamed Animal'
  }

  function getYoungStockDisplayName(record: any) {
    if (record.name) return record.name
    if (record.band_number) return `Band ${record.band_number}`
    if (record.animal_subtype) return `Unnamed ${record.animal_subtype}`
    if (record.animal_type) return `Unnamed ${record.animal_type}`
    return 'Unnamed Young Stock'
  }

  if (loading) {
    return <p>Loading breeding project...</p>
  }

  if (!project) {
    return (
      <div>
        <Link href="/breeding" className="text-blue-600 underline">
          Back to Breeding
        </Link>

        <p className="mt-4">
          Breeding project not found.
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
        <h1 className="text-3xl font-bold mb-2">
          {project.project_name}
        </h1>

        <p>Status: {project.status || 'Unknown'}</p>
        <p>Male: {getAnimalDisplayName(project.male)}</p>
        <p>Female: {getAnimalDisplayName(project.female)}</p>
        <p>Eggs Set: {project.eggs_set_date || 'Not set'}</p>
        <p>Expected Hatch: {project.expected_hatch_date || 'Not set'}</p>
        <p>Actual Hatch: {project.actual_hatch_date || 'Not set'}</p>
        <p>Chicks Hatched: {project.chicks_hatched || 0}</p>
        <p>Notes: {project.notes || 'None'}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Young Stock Summary
        </h2>

        <p>Linked Young Stock: {youngStock.length}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Linked Young Stock
      </h2>

      <div className="grid gap-4">
        {youngStock.length === 0 ? (
          <p>No young stock linked to this breeding project yet.</p>
        ) : (
          youngStock.map((record) => (
            <div
              key={record.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <h3 className="text-xl font-bold capitalize">
                {getYoungStockDisplayName(record)}
              </h3>

              <p>Type: {record.animal_type || 'Unknown'}</p>
              <p>Breed: {record.breed || 'Unknown'}</p>
              <p>Hatch Date: {record.hatch_date || 'Unknown'}</p>
              <p>Promoted: {record.promoted_to_animal ? 'Yes' : 'No'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
