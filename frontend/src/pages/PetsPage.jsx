import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPets, getCategories, searchPets } from '../services/api'
import PetCard from '../components/PetCard'

const STATUSES = ['AVAILABLE', 'PENDING', 'ADOPTED']

export default function PetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pets, setPets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const status     = searchParams.get('status') || ''
  const categoryId = searchParams.get('categoryId') || ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (status)     params.status     = status
      if (categoryId) params.categoryId = categoryId
      const data = await getPets(params)
      setPets(data)
    } finally {
      setLoading(false)
    }
  }, [status, categoryId])

  useEffect(() => { getCategories().then(setCategories) }, [])
  useEffect(() => { load() }, [load])

  const handleSearch = async e => {
    e.preventDefault()
    if (!query.trim()) return load()
    setLoading(true)
    try {
      const data = await searchPets(query.trim())
      setPets(data)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key, value) => {
    const p = Object.fromEntries(searchParams)
    if (value) p[key] = value
    else delete p[key]
    setSearchParams(p)
  }

  const clearFilters = () => {
    setSearchParams({})
    setQuery('')
  }

  const hasFilters = status || categoryId || query

  return (
    <div className="pets-page">
      <div className="container">
        <div className="pets-page__header">
          <h1 className="pets-page__title">All Pets</h1>
          <p className="pets-page__sub">Find your perfect companion</p>
        </div>

        {/* Toolbar */}
        <div className="pets-page__toolbar">
          <form className="pets-page__search-wrap" onSubmit={handleSearch}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </form>

          <div className="pets-page__filters">
            <select
              className="pets-page__select"
              value={status}
              onChange={e => updateFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              className="pets-page__select"
              value={categoryId}
              onChange={e => updateFilter('categoryId', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>

            {hasFilters && (
              <button className="pets-page__clear" onClick={clearFilters}>✕ Clear</button>
            )}
          </div>
        </div>

        <p className="pets-page__count">
          Showing <span>{pets.length}</span> pet{pets.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : pets.length === 0 ? (
          <div className="pets-page__empty">
            <p>🐾</p>
            <p>No pets found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="pets-page__grid">
            {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
          </div>
        )}
      </div>
    </div>
  )
}
