'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Filter } from 'lucide-react'

const supabase = createClient()

export default function ExpensesPage() {
  const [userId, setUserId] = useState('')
  const [expenses, setExpenses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [expenseName, setExpenseName] = useState('')
  const [category, setCategory] = useState('feed')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [vendor, setVendor] = useState('')
  const [notes, setNotes] = useState('')

const [editingId, setEditingId] = useState<string | null>(null)

const [editForm, setEditForm] = useState({
  expense_name: '',
  category: 'feed',
  amount: '',
  expense_date: '',
  vendor: '',
  notes: '',
})

  async function fetchExpenses(currentUserId = userId) {
    if (!currentUserId) return

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', currentUserId)
      .order('expense_date', { ascending: false })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setExpenses(data || [])
  }

  async function addExpense() {
    if (!expenseName) {
      alert('Please enter an expense name')
      return
    }

    const { error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: userId,
          expense_name: expenseName,
          category,
          amount: amount ? Number(amount) : 0,
          expense_date: expenseDate || null,
          vendor,
          notes,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setExpenseName('')
    setCategory('feed')
    setAmount('')
    setExpenseDate('')
    setVendor('')
    setNotes('')
    setShowForm(false)

    fetchExpenses()
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    fetchExpenses()
  }

async function updateExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .update({
      expense_name: editForm.expense_name,
      category: editForm.category,
      amount: editForm.amount ? Number(editForm.amount) : 0,
      expense_date: editForm.expense_date || null,
      vendor: editForm.vendor,
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
  fetchExpenses()
}

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUserId(data.user.id)
      fetchExpenses(data.user.id)
    }

    loadUserData()
  }, [])

  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + Number(expense.amount || 0)
  }, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 sm:text-3xl sm:mb-6">
        Expenses
      </h1>

      <div className="bg-white p-3 rounded-xl shadow mb-5 sm:p-4 sm:mb-6">
        <p className="text-gray-600">
          Total Expenses
        </p>

        <p className="text-2xl font-bold sm:text-3xl">
          ${totalExpenses.toFixed(2)}
        </p>
      </div>

      <button
        className="bg-black text-white px-4 py-2 rounded mb-5 min-h-11 w-full sm:w-auto sm:mb-6"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Close Form' : '+ Add Expense'}
      </button>

      {showForm && (
        <div className="bg-white p-3 rounded-xl shadow mb-5 sm:p-4 sm:mb-6">
          <h2 className="text-xl font-bold mb-4">
            Add Expense
          </h2>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Expense Name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="feed">Feed</option>
            <option value="bedding">Bedding</option>
            <option value="medicine">Medicine</option>
            <option value="vet">Vet</option>
            <option value="supplies">Supplies</option>
            <option value="garden">Garden</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>

          <input
            className="border p-2 w-full mb-3"
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="mb-3">
            <label className="block font-medium mb-1">
              Expense Date
            </label>

            <input
              className="border p-2 w-full"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded min-h-11 w-full sm:w-auto"
            onClick={addExpense}
          >
            Add Expense
          </button>
        </div>
      )}

      <div className="flex items-stretch gap-2 mb-4">
        <input
          className="border p-2 w-full"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          type="button"
          className="bg-black text-white p-2 rounded flex h-11 w-11 shrink-0 items-center justify-center"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filter expenses"
        >
          <Filter size={22} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-3 rounded-xl shadow mb-4">
          <select
            className="border p-2 w-full mb-3"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="feed">Feed</option>
            <option value="bedding">Bedding</option>
            <option value="medicine">Medicine</option>
            <option value="vet">Vet</option>
            <option value="supplies">Supplies</option>
            <option value="garden">Garden</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>

          <button
            type="button"
            className="border px-3 py-2 rounded"
            onClick={() => setFilterCategory('all')}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:gap-4">
        {expenses
          .filter((expense) => {
            const search = searchTerm.toLowerCase()

            const matchesSearch =
              search === '' ||
              expense.expense_name?.toLowerCase().includes(search) ||
              expense.category?.toLowerCase().includes(search) ||
              expense.vendor?.toLowerCase().includes(search) ||
              expense.notes?.toLowerCase().includes(search)

            const matchesCategory =
              filterCategory === 'all' || expense.category === filterCategory

            return matchesSearch && matchesCategory
          })
          .map((expense) => (
          <div
            key={expense.id}
            className="bg-white p-3 rounded-xl shadow sm:p-4"
          >
            {editingId === expense.id ? (
  <div className="grid gap-2 sm:grid-cols-2">
    <input
      className="border p-2"
      placeholder="Expense Name"
      value={editForm.expense_name}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          expense_name: e.target.value,
        })
      }
    />

    <select
      className="border p-2"
      value={editForm.category}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          category: e.target.value,
        })
      }
    >
      <option value="feed">Feed</option>
      <option value="bedding">Bedding</option>
      <option value="medicine">Medicine</option>
      <option value="vet">Vet</option>
      <option value="supplies">Supplies</option>
      <option value="garden">Garden</option>
      <option value="equipment">Equipment</option>
      <option value="other">Other</option>
    </select>

    <input
      className="border p-2"
      type="number"
      step="0.01"
      placeholder="Amount"
      value={editForm.amount}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          amount: e.target.value,
        })
      }
    />

    <div>
      <label className="block font-medium mb-1">
        Expense Date
      </label>

      <input
        className="border p-2 w-full"
        type="date"
        value={editForm.expense_date}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            expense_date: e.target.value,
          })
        }
      />
    </div>

    <input
      className="border p-2"
      placeholder="Vendor"
      value={editForm.vendor}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          vendor: e.target.value,
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
      {expense.expense_name}
    </h2>

    <p className="text-sm capitalize text-gray-600 sm:text-base">
      {expense.category}
    </p>
      </div>

      <p className="shrink-0 text-lg font-bold sm:text-xl">
        ${Number(expense.amount || 0).toFixed(2)}
      </p>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:text-base">
      <p>Date: {expense.expense_date || 'Not set'}</p>
      <p>Vendor: {expense.vendor || 'None'}</p>
    </div>

    {expense.notes && (
      <p className="mt-3 text-sm sm:text-base">
        Notes: {expense.notes}
      </p>
    )}
  </div>
)}

            <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium"
              onClick={() => deleteExpense(expense.id)}
            >
              Delete
            </button>

            {editingId === expense.id ? (
  <>
  <button
    className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium"
    onClick={() => updateExpense(expense.id)}
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
      setEditingId(expense.id)

      setEditForm({
        expense_name: expense.expense_name || '',
        category: expense.category || 'feed',
        amount: expense.amount?.toString() || '',
        expense_date: expense.expense_date || '',
        vendor: expense.vendor || '',
        notes: expense.notes || '',
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
