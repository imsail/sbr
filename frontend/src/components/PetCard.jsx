import { useNavigate } from 'react-router-dom'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400'

export default function PetCard({ pet }) {
  const navigate = useNavigate()

  return (
    <div className="pet-card" onClick={() => navigate(`/pets/${pet.id}`)}>
      <div className="pet-card__image-wrap">
        <img
          className="pet-card__image"
          src={pet.imageUrl || PLACEHOLDER}
          alt={pet.name}
          onError={e => { e.target.src = PLACEHOLDER }}
        />
        <span className={`pet-card__status pet-card__status--${pet.status}`}>
          {pet.status}
        </span>
      </div>

      <div className="pet-card__body">
        {pet.category && (
          <div className="pet-card__category">{pet.category.icon} {pet.category.name}</div>
        )}
        <div className="pet-card__name">{pet.name}</div>
        <div className="pet-card__meta">
          <span>{pet.species}</span>
          {pet.breed && <span>· {pet.breed}</span>}
          <span>· {pet.age} yr{pet.age !== 1 ? 's' : ''}</span>
        </div>
        {pet.description && (
          <p className="pet-card__desc">{pet.description}</p>
        )}
        <div className="pet-card__footer">
          <span className="pet-card__price">${pet.price.toFixed(2)}</span>
          <button className="pet-card__btn" onClick={e => { e.stopPropagation(); navigate(`/pets/${pet.id}`) }}>
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
