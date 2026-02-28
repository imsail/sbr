import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPets, getCategories } from '../services/api'
import PetCard from '../components/PetCard'

export default function HomePage() {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPets(), getCategories()])
      .then(([p, c]) => { setPets(p); setCategories(c) })
      .finally(() => setLoading(false))
  }, [])

  const featured = pets.filter(p => p.status === 'AVAILABLE').slice(0, 4)
  const available = pets.filter(p => p.status === 'AVAILABLE').length

  const catCounts = {}
  pets.forEach(p => {
    if (p.category) catCounts[p.category.id] = (catCounts[p.category.id] || 0) + 1
  })

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow">🐾 Find Your Best Friend</span>
            <h1 className="hero__title">
              The Perfect Pet is<br /><span>Waiting for You</span>
            </h1>
            <p className="hero__sub">
              Discover thousands of loving pets ready for adoption.
              Dogs, cats, birds, fish, and more — all under one roof.
            </p>
            <div className="hero__cta">
              <button className="hero__btn-primary" onClick={() => navigate('/pets')}>
                Browse Pets
              </button>
              <button className="hero__btn-outline" onClick={() => navigate('/pets?status=AVAILABLE')}>
                Available Now
              </button>
            </div>
          </div>
          <div className="hero__image">
            <img
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600"
              alt="Happy pets"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar__grid">
            <div className="stats-bar__item">
              <div className="stats-bar__value">{pets.length}+</div>
              <div className="stats-bar__label">Total Pets</div>
            </div>
            <div className="stats-bar__item">
              <div className="stats-bar__value">{available}</div>
              <div className="stats-bar__label">Available Now</div>
            </div>
            <div className="stats-bar__item">
              <div className="stats-bar__value">{categories.length}</div>
              <div className="stats-bar__label">Categories</div>
            </div>
            <div className="stats-bar__item">
              <div className="stats-bar__value">100%</div>
              <div className="stats-bar__label">Happy Homes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2 className="categories__title">Browse by Category</h2>
          <p className="categories__sub">Find the perfect type of pet for your lifestyle</p>
          <div className="categories__grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="categories__card"
                onClick={() => navigate(`/pets?categoryId=${cat.id}`)}
              >
                <span className="categories__icon">{cat.icon}</span>
                <span className="categories__name">{cat.name}</span>
                <span className="categories__count">{catCounts[cat.id] || 0} pets</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="featured">
        <div className="container">
          <div className="featured__header">
            <div>
              <h2 className="featured__title">Featured Pets</h2>
              <p className="featured__sub">Meet some of our wonderful available companions</p>
            </div>
            <button className="featured__link" onClick={() => navigate('/pets')}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="featured__grid">
              {featured.map(pet => <PetCard key={pet.id} pet={pet} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
