import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPets, getCategories, searchPets } from '../services/api'
import PetCard from '../components/PetCard'
import Pagination from '../components/Pagination'

const STATUSES   = ['AVAILABLE', 'PENDING', 'ADOPTED']
const SORT_OPTIONS = [
  { value: 'id',    label: 'Newest first',   dir: 'desc' },
  { value: 'id',    label: 'Oldest first',   dir: 'asc'  },
  { value: 'price', label: 'Price: low→high', dir: 'asc' },
  { value: 'price', label: 'Price: high→low', dir: 'desc'},
  { value: 'name',  label: 'Name A→Z',        dir: 'asc' },
  { value: 'age',   label: 'Age: young first', dir: 'asc'},
]

export default function PetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pageData, setPageData] = useState(null)   // Spring Page<Pet> response
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const [sortIdx, setSortIdx]   = useState(0)

  // URL-driven filters
  const status      = searchParams.get('status')     || ''
  const categoryId  = searchParams.get('categoryId') || ''
  const page        = Number(searchParams.get('page') || 0)
  const size        = Number(searchParams.get('size') || 8)

  const { value: sort, dir } = SORT_OPTIONS[sortIdx]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size, sort, dir }
      if (status)     params.status     = status
      if (categoryId) params.categoryId = categoryId
      const data = await getPets(params)
      setPageData(data)
    } finally {
      setLoading(false)
    }
  }, [status, categoryId, page, size, sort, dir])

  useEffect(() => { getCategories().then(setCategories) }, [])
  useEffect(() => { if (!query) load() }, [load, query])

  const handleSearch = async e => {
    e.preventDefault()
    if (!query.trim()) return load()
    setLoading(true)
    try {
      const data = await searchPets(query.trim(), { page, size })
      setPageData(data)
    } finally {
      setLoading(false)
    }
  }

  // Helper to update a single URL param and reset page to 0
  const updateParam = (key, value) => {
    const p = Object.fromEntries(searchParams)
    if (value) p[key] = value
    else delete p[key]
    p.page = '0'          // reset to first page on filter change
    setSearchParams(p)
    setQuery('')
  }

  const updatePage = newPage => {
    const p = Object.fromEntries(searchParams)
    p.page = String(newPage)
    setSearchParams(p)
  }

  const updateSize = newSize => {
    const p = Object.fromEntries(searchParams)
    p.size = String(newSize)
    p.page = '0'
    setSearchParams(p)
  }

  const clearFilters = () => {
    setSearchParams({ page: '0', size: String(size) })
    setQuery('')
    setSortIdx(0)
  }

  const hasFilters = status || categoryId || query

  const pets       = pageData?.content       ?? []
  const totalPages = pageData?.totalPages    ?? 0
  const totalElems = pageData?.totalElements ?? 0

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
              onChange={e => updateParam('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              className="pets-page__select"
              value={categoryId}
              onChange={e => updateParam('categoryId', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>

            <select
              className="pets-page__select"
              value={sortIdx}
              onChange={e => { setSortIdx(Number(e.target.value)); updatePage(0) }}
            >
              {SORT_OPTIONS.map((o, i) => (
                <option key={i} value={i}>{o.label}</option>
              ))}
            </select>

            {hasFilters && (
              <button className="pets-page__clear" onClick={clearFilters}>✕ Clear</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : pets.length === 0 ? (
          <div className="pets-page__empty">
            <p>🐾</p>
            <p>No pets found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="pets-page__grid">
              {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElems}
              size={size}
              onPageChange={updatePage}
              onSizeChange={updateSize}
            />
          </>
        )}
      </div>
    </div>
  )
}
