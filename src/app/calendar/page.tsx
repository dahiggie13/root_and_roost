'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export default function CalendarPage() {
  const [userId, setUserId] = useState('')
  const [events, setEvents] = useState<any[]>([])
  const [filterType, setFilterType] = useState('all')

const [editingId, setEditingId] = useState<string | null>(null)

const [editForm, setEditForm] = useState({
  title: '',
  event_type: 'manual',
  event_date: '',
  event_time: '',
  notes: '',
})

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('manual')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [notes, setNotes] = useState('')

  async function fetchCalendar(currentUserId = userId) {
    if (!currentUserId) return

    const combinedEvents: any[] = []

    const { data: manualEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', currentUserId)

    manualEvents?.forEach((event) => {
      combinedEvents.push({
        id: `manual-${event.id}`,
        sourceId: event.id,
        title: event.title,
        type: event.event_type || 'manual',
        date: event.event_date,
        time: event.event_time,
        notes: event.notes,
        source: 'manual',
      })
    })

    const { data: breedingProjects } = await supabase
      .from('breeding_projects')
      .select('id, project_name, expected_hatch_date')
      .eq('user_id', currentUserId)
      .not('expected_hatch_date', 'is', null)

    breedingProjects?.forEach((project) => {
      combinedEvents.push({
        id: `breeding-${project.id}`,
        sourceId: project.id,
        title: `Hatch: ${project.project_name}`,
        type: 'breeding',
        date: project.expected_hatch_date,
        time: null,
        notes: 'Expected hatch date',
        source: 'breeding',
      })
    })

    const { data: crops } = await supabase
      .from('crops')
      .select('id, crop_name, expected_harvest_date')
      .eq('user_id', currentUserId)
      .not('expected_harvest_date', 'is', null)

    crops?.forEach((crop) => {
      combinedEvents.push({
        id: `garden-${crop.id}`,
        sourceId: crop.id,
        title: `Harvest: ${crop.crop_name}`,
        type: 'garden',
        date: crop.expected_harvest_date,
        time: null,
        notes: 'Expected harvest date',
        source: 'garden',
      })
    })

    const { data: healthRecords } = await supabase
      .from('health_records')
      .select('id, record_type, record_date, treatment')
      .eq('user_id', currentUserId)
      .not('record_date', 'is', null)

    healthRecords?.forEach((record) => {
      combinedEvents.push({
        id: `health-${record.id}`,
        sourceId: record.id,
        title: `Health: ${record.record_type}`,
        type: 'health',
        date: record.record_date,
        time: null,
        notes: record.treatment || 'Health record',
        source: 'health',
      })
    })

    const { data: sales } = await supabase
      .from('sales')
      .select('id, item_name, sale_date, price')
      .eq('user_id', currentUserId)
      .not('sale_date', 'is', null)

    sales?.forEach((sale) => {
      combinedEvents.push({
        id: `sale-${sale.id}`,
        sourceId: sale.id,
        title: `Sale: ${sale.item_name}`,
        type: 'finance',
        date: sale.sale_date,
        time: null,
        notes: `$${Number(sale.price || 0).toFixed(2)}`,
        source: 'sales',
      })
    })

    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, expense_name, expense_date, amount')
      .eq('user_id', currentUserId)
      .not('expense_date', 'is', null)

    expenses?.forEach((expense) => {
      combinedEvents.push({
        id: `expense-${expense.id}`,
        sourceId: expense.id,
        title: `Expense: ${expense.expense_name}`,
        type: 'finance',
        date: expense.expense_date,
        time: null,
        notes: `$${Number(expense.amount || 0).toFixed(2)}`,
        source: 'expenses',
      })
    })

    combinedEvents.sort((a, b) => {
      const dateA = `${a.date || ''} ${a.time || ''}`
      const dateB = `${b.date || ''} ${b.time || ''}`

      return dateA.localeCompare(dateB)
    })

    setEvents(combinedEvents)
  }

  async function addEvent() {
    if (!title) {
      alert('Please enter an event title')
      return
    }

    if (!eventDate) {
      alert('Please select an event date')
      return
    }

    const { error } = await supabase
      .from('calendar_events')
      .insert([
        {
          user_id: userId,
          title,
          event_type: eventType,
          event_date: eventDate,
          event_time: eventTime || null,
          notes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setTitle('')
    setEventType('manual')
    setEventDate('')
    setEventTime('')
    setNotes('')
    setShowForm(false)

    fetchCalendar()
  }

  async function deleteManualEvent(event: any) {
    if (event.source !== 'manual') {
      alert('Only manual calendar events can be deleted from the calendar.')
      return
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', event.sourceId)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchCalendar()
  }

async function updateManualEvent(event: any) {
  if (event.source !== 'manual') {
    alert('Only manual calendar events can be edited from the calendar.')
    return
  }

  const { error } = await supabase
    .from('calendar_events')
    .update({
      title: editForm.title,
      event_type: editForm.event_type,
      event_date: editForm.event_date,
      event_time: editForm.event_time || null,
      notes: editForm.notes,
    })
    .eq('id', event.sourceId)
    .eq('user_id', userId)

  if (error) {
    console.log(error)
    alert(error.message)
    return
  }

  setEditingId(null)
  fetchCalendar()
}

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchCalendar(data.user.id)
    }

    loadUserData()
  }, [])

  const filteredEvents = events.filter((event) => {
    return filterType === 'all' || event.type === filterType
  })

  const upcomingEvents = events.filter((event) => {
    const today = new Date().toISOString().split('T')[0]
    return event.date >= today
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Calendar
      </h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <p className="text-gray-600">
          Upcoming Events
        </p>

        <p className="text-3xl font-bold">
          {upcomingEvents.length}
        </p>
      </div>

      <button
        className="bg-black text-white px-4 py-2 rounded mb-6"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Close Form' : '+ Add Event'}
      </button>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            Add Event
          </h2>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-3"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="manual">Manual</option>
            <option value="breeding">Breeding</option>
            <option value="garden">Garden</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
            <option value="task">Task</option>
          </select>

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Event Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Event Time
            </label>

            <input
              className="border p-2 w-full"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addEvent}
          >
            Add Event
          </button>
        </div>
      )}

      <select
        className="border p-2 w-full mb-4"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="all">All Events</option>
        <option value="manual">Manual</option>
        <option value="breeding">Breeding</option>
        <option value="garden">Garden</option>
        <option value="health">Health</option>
        <option value="finance">Finance</option>
        <option value="task">Task</option>
      </select>

      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <p>No calendar events found.</p>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              {editingId === event.id ? (
  <div className="grid gap-2">
    <input
      className="border p-2"
      placeholder="Event Title"
      value={editForm.title}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          title: e.target.value,
        })
      }
    />

    <select
      className="border p-2"
      value={editForm.event_type}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          event_type: e.target.value,
        })
      }
    >
      <option value="manual">Manual</option>
      <option value="breeding">Breeding</option>
      <option value="garden">Garden</option>
      <option value="health">Health</option>
      <option value="finance">Finance</option>
      <option value="task">Task</option>
    </select>

    <div>
      <label className="block font-medium mb-1">
        Event Date
      </label>

      <input
        className="border p-2 w-full"
        type="date"
        value={editForm.event_date}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            event_date: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        Event Time
      </label>

      <input
        className="border p-2 w-full"
        type="time"
        value={editForm.event_time}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            event_time: e.target.value,
          })
        }
      />
    </div>

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
      {event.title}
    </h2>

    <p>Type: {event.type}</p>
    <p>Date: {event.date}</p>
    <p>Time: {event.time || 'Any time'}</p>
    <p>Source: {event.source}</p>
    <p>Notes: {event.notes || 'None'}</p>
  </div>
)}

              {event.source === 'manual' && (
  <>
    <button
      className="bg-red-500 text-white px-3 py-1 rounded mt-3"
      onClick={() => deleteManualEvent(event)}
    >
      Delete
    </button>

    {editingId === event.id ? (
      <>
      <button
        className="bg-green-500 text-white px-3 py-1 rounded mt-3 ml-2"
        onClick={() => updateManualEvent(event)}
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
          setEditingId(event.id)

          setEditForm({
            title: event.title || '',
            event_type: event.type || 'manual',
            event_date: event.date || '',
            event_time: event.time || '',
            notes: event.notes || '',
          })
        }}
      >
        Edit
      </button>
    )}
  </>
)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
