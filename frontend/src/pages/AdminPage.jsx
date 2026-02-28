import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPet, createPet, updatePet, getCategories } from '../services/api'

const STATUSES = ['AVAILABLE', 'PENDING', 'ADOPTED']

const EMPTY = {
  name: '', species: '', breed: '', age: 0, price: 0,
  description: '', imageUrl: '', status: 'AVAILABLE', categoryId: ''
}

export default function AdminPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getCategories().then(setCategories)
    if (isEdit) {
      getPet(id).then(pet => {
        setForm({
          name:        pet.name,
          species:     pet.species,
          breed:       pet.breed || '',
          age:         pet.age,
          price:       pet.price,
          description: pet.description || '',
          imageUrl:    pet.imageUrl || '',
          status:      pet.status,
          categoryId:  pet.category?.id || ''
        })
      })
    }
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      age:        Number(form.age),
      price:      Number(form.price),
      categoryId: form.categoryId ? Number(form.categoryId) : null
    }
    try {
      if (isEdit) {
        await updatePet(id, payload)
        showToast('Pet updated successfully!')
        setTimeout(() => navigate(`/pets/${id}`), 1200)
      } else {
        const created = await createPet(payload)
        showToast('Pet added successfully!')
        setTimeout(() => navigate(`/pets/${created.id}`), 1200)
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin">
      <div className="container">
        <div className="admin__header">
          <div>
            <h1>{isEdit ? 'Edit Pet' : 'Add New Pet'}</h1>
            <p>{isEdit ? 'Update the pet information below.' : 'Fill in the details to list a new pet.'}</p>
          </div>
          <button className="admin__back" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <form className="pet-form" onSubmit={handleSubmit}>
          <h2 className="pet-form__title">Pet Information</h2>

          <div className="pet-form__grid">
            {/* Name */}
            <div className="pet-form__group">
              <label>Name *</label>
              <input
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Buddy"
              />
            </div>

            {/* Species */}
            <div className="pet-form__group">
              <label>Species *</label>
              <input
                required
                value={form.species}
                onChange={e => set('species', e.target.value)}
                placeholder="e.g. Dog, Cat, Bird"
              />
            </div>

            {/* Breed */}
            <div className="pet-form__group">
              <label>Breed</label>
              <input
                value={form.breed}
                onChange={e => set('breed', e.target.value)}
                placeholder="e.g. Golden Retriever"
              />
            </div>

            {/* Age */}
            <div className="pet-form__group">
              <label>Age (years) *</label>
              <input
                type="number"
                min="0"
                required
                value={form.age}
                onChange={e => set('age', e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="pet-form__group">
              <label>Price ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={e => set('price', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="pet-form__group">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Category */}
            <div className="pet-form__group">
              <label>Category</label>
              <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div className="pet-form__group">
              <label>Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => set('imageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Description */}
            <div className="pet-form__group pet-form__full">
              <label>Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Tell us about this pet…"
              />
            </div>
          </div>

          <div className="pet-form__actions">
            <button type="button" className="pet-form__cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="pet-form__submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? '💾 Save Changes' : '➕ Add Pet'}
            </button>
          </div>
        </form>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
