'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Filter } from 'lucide-react'

const supabase = createClient()

export default function SalesPage() {
  const [userId, setUserId] = useState('')
  const [sales, setSales] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSaleType, setFilterSaleType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [itemName, setItemName] = useState('')
  const [saleType, setSaleType] = useState('animal')
  const [animalId, setAnimalId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [saleDate, setSaleDate] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [notes, setNotes] = useState('')

const [editingId, setEditingId] = useState<string | null>(null)

const [editForm, setEditForm] = useState({
  item_name: '',
  sale_type: 'animal',
  animal_id: '',
  quantity: '1',
  price: '',
  sale_date: '',
  buyer_name: '',
  notes: '',
})

  async function fetchSales(currentUserId = userId) {
    if (!currentUserId) return

    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        animals (
          id,
          name,
          animal_type,
          band_number
        )
      `)
      .eq('user_id', currentUserId)
      .order('sale_date', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setSales(data || [])
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

  async function addSale() {
    if (!itemName) {
      alert('Please enter what was sold')
      return
    }

    const { error } = await supabase
      .from('sales')
      .insert([
        {
          user_id: userId,
          item_name: itemName,
          sale_type: saleType,
          animal_id: animalId || null,
          quantity: quantity ? Number(quantity) : 1,
          price: price ? Number(price) : 0,
          sale_date: saleDate || null,
          buyer_name: buyerName,
          notes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setItemName('')
    setSaleType('animal')
    setAnimalId('')
    setQuantity('1')
    setPrice('')
    setSaleDate('')
    setBuyerName('')
    setNotes('')
    setShowForm(false)

    fetchSales()
  }

  async function deleteSale(id: string) {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchSales()
  }

async function updateSale(id: string) {
  const { error } = await supabase
    .from('sales')
    .update({
      item_name: editForm.item_name,
      sale_type: editForm.sale_type,
      animal_id: editForm.animal_id || null,
      quantity: editForm.quantity ? Number(editForm.quantity) : 1,
      price: editForm.price ? Number(editForm.price) : 0,
      sale_date: editForm.sale_date || null,
      buyer_name: editForm.buyer_name,
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
  fetchSales()
}

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchSales(data.user.id)
      fetchAnimals(data.user.id)
    }

    loadUserData()
  }, [])

  const totalSales = sales.reduce((sum, sale) => {
    return sum + Number(sale.price || 0)
  }, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 sm:text-3xl sm:mb-6">
        Sales
      </h1>

      <div className="bg-white p-3 rounded-xl shadow mb-5 sm:p-4 sm:mb-6">
        <p className="text-gray-600">
          Total Sales
        </p>

        <p className="text-2xl font-bold sm:text-3xl">
          ${totalSales.toFixed(2)}
        </p>
      </div>

      <button
        className="bg-black text-white px-4 py-2 rounded mb-5 min-h-11 w-full sm:w-auto sm:mb-6"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Close Form' : '+ Add Sale'}
      </button>

      {showForm && (
        <div className="bg-white p-3 rounded-xl shadow mb-5 sm:p-4 sm:mb-6">
          <h2 className="text-xl font-bold mb-4">
            Add Sale
          </h2>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Item Sold"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-3"
            value={saleType}
            onChange={(e) => setSaleType(e.target.value)}
          >
            <option value="animal">Animal</option>
            <option value="eggs">Eggs</option>
            <option value="milk">Milk</option>
            <option value="produce">Produce</option>
            <option value="other">Other</option>
          </select>

          <select
            className="border p-2 w-full mb-3"
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
          >
            <option value="">No Animal Linked</option>

            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name || animal.band_number || 'Unnamed'} - {animal.animal_type}
              </option>
            ))}
          </select>

          <input
            className="border p-2 w-full mb-3"
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            type="number"
            step="0.01"
            placeholder="Sale Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Sale Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </div>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Buyer Name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded min-h-11 w-full sm:w-auto"
            onClick={addSale}
          >
            Add Sale
          </button>
        </div>
      )}

      <div className="flex items-stretch gap-2 mb-4">
        <input
          className="border p-2 w-full"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          type="button"
          className="bg-black text-white p-2 rounded flex h-11 w-11 shrink-0 items-center justify-center"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filter sales"
        >
          <Filter size={22} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-3 rounded-xl shadow mb-4">
          <select
            className="border p-2 w-full mb-3"
            value={filterSaleType}
            onChange={(e) => setFilterSaleType(e.target.value)}
          >
            <option value="all">All Sale Types</option>
            <option value="animal">Animal</option>
            <option value="eggs">Eggs</option>
            <option value="milk">Milk</option>
            <option value="produce">Produce</option>
            <option value="other">Other</option>
          </select>

          <button
            type="button"
            className="border px-3 py-2 rounded"
            onClick={() => setFilterSaleType('all')}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:gap-4">
        {sales
          .filter((sale) => {
            const search = searchTerm.toLowerCase()

            const matchesSearch =
              search === '' ||
              sale.item_name?.toLowerCase().includes(search) ||
              sale.sale_type?.toLowerCase().includes(search) ||
              sale.buyer_name?.toLowerCase().includes(search) ||
              sale.notes?.toLowerCase().includes(search) ||
              sale.animals?.name?.toLowerCase().includes(search) ||
              sale.animals?.band_number?.toLowerCase().includes(search)

            const matchesSaleType =
              filterSaleType === 'all' || sale.sale_type === filterSaleType

            return matchesSearch && matchesSaleType
          })
          .map((sale) => (
          <div
            key={sale.id}
            className="bg-white p-3 rounded-xl shadow sm:p-4"
          >
            {editingId === sale.id ? (
  <div className="grid gap-2 sm:grid-cols-2">
    <input
      className="border p-2"
      placeholder="Item Sold"
      value={editForm.item_name}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          item_name: e.target.value,
        })
      }
    />

    <select
      className="border p-2"
      value={editForm.sale_type}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          sale_type: e.target.value,
        })
      }
    >
      <option value="animal">Animal</option>
      <option value="eggs">Eggs</option>
      <option value="milk">Milk</option>
      <option value="produce">Produce</option>
      <option value="other">Other</option>
    </select>

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
          {animal.name || animal.band_number || 'Unnamed'} - {animal.animal_type}
        </option>
      ))}
    </select>

    <input
      className="border p-2"
      type="number"
      placeholder="Quantity"
      value={editForm.quantity}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          quantity: e.target.value,
        })
      }
    />

    <input
      className="border p-2"
      type="number"
      step="0.01"
      placeholder="Sale Price"
      value={editForm.price}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          price: e.target.value,
        })
      }
    />

    <div>
      <label className="block font-medium mb-1">
        Sale Date
      </label>

      <input
        className="border p-2 w-full"
        type="date"
        value={editForm.sale_date}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            sale_date: e.target.value,
          })
        }
      />
    </div>

    <input
      className="border p-2"
      placeholder="Buyer Name"
      value={editForm.buyer_name}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          buyer_name: e.target.value,
        })
      }
    />

    <textarea
      className="border p-2 sm:col-span-2"
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
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
    <h2 className="text-lg font-bold leading-tight sm:text-xl">
      {sale.item_name}
    </h2>

    <p className="text-sm capitalize text-gray-600 sm:text-base">
      {sale.sale_type}
    </p>
      </div>

      <p className="shrink-0 text-lg font-bold sm:text-xl">
        ${Number(sale.price || 0).toFixed(2)}
      </p>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:text-base">
      <p>Qty: {sale.quantity}</p>
      <p>Date: {sale.sale_date || 'Not set'}</p>
      <p>Buyer: {sale.buyer_name || 'None'}</p>
      <p>
        Animal: {sale.animals?.name || sale.animals?.band_number || 'None'}
      </p>
    </div>

    {sale.notes && (
      <p className="mt-3 text-sm sm:text-base">
        Notes: {sale.notes}
      </p>
    )}
  </div>
)}
            <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium"
              onClick={() => deleteSale(sale.id)}
            >
              Delete
            </button>

{editingId === sale.id ? (
  <>
  <button
    className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium"
    onClick={() => updateSale(sale.id)}
  >
    Save
  </button>

  <button
    className="border px-3 py-2 rounded text-sm font-medium"
    onClick={() => setEditingId(null)}
  >
    Cancel
  </button>
  </>
) : (
  <button
    className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium"
    onClick={() => {
      setEditingId(sale.id)

      setEditForm({
        item_name: sale.item_name || '',
        sale_type: sale.sale_type || 'animal',
        animal_id: sale.animal_id || '',
        quantity: sale.quantity?.toString() || '1',
        price: sale.price?.toString() || '',
        sale_date: sale.sale_date || '',
        buyer_name: sale.buyer_name || '',
        notes: sale.notes || '',
      })
    }}
  >
    Edit
  </button>
)}
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
