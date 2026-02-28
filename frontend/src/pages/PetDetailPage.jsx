import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPet, deletePet, updatePet } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600'

export default function PetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getPet(id).then(setPet).catch(() => navigate('/pets')).finally(() => setLoading(false))
  }, [id])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdopt = async () => {
    if (!window.confirm(`Mark ${pet.name} as Adopted?`)) return
    try {
      const updated = await updatePet(id, {
        ...pet,
        categoryId: pet.category?.id,
        status: 'ADOPTED'
      })
      setPet(updated)
      showToast(`${pet.name} has been marked as adopted! 🎉`)
    } catch {
      showToast('Failed to update status.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${pet.name}? This cannot be undone.`)) return
    try {
      await deletePet(id)
      showToast('Pet deleted.')
      setTimeout(() => navigate('/pets'), 1000)
    } catch {
      showToast('Failed to delete pet.', 'error')
    }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (!pet)   return null

  return (
    <div className="pet-detail">
      <div className="container">
        <div className="pet-detail__back" onClick={() => navigate(-1)}>
          ← Back
        </div>

        <div className="pet-detail__grid">
          {/* Image */}
          <div className="pet-detail__image-wrap">
            <img
              src={pet.imageUrl || PLACEHOLDER}
              alt={pet.name}
              onError={e => { e.target.src = PLACEHOLDER }}
            />
          </div>

          {/* Info */}
          <div className="pet-detail__info">
            {pet.category && (
              <div className="pet-detail__category">
                {pet.category.icon} {pet.category.name}
              </div>
            )}

            <h1 className="pet-detail__name">{pet.name}</h1>

            <div className="pet-detail__status-row">
              <span className={`status--${pet.status}`}>{pet.status}</span>
            </div>

            <div className="pet-detail__price">${pet.price.toFixed(2)}</div>

            <div className="pet-detail__attrs">
              <div className="pet-detail__attr">
                <div className="pet-detail__attr-label">Species</div>
                <div className="pet-detail__attr-value">{pet.species}</div>
              </div>
              {pet.breed && (
                <div className="pet-detail__attr">
                  <div className="pet-detail__attr-label">Breed</div>
                  <div className="pet-detail__attr-value">{pet.breed}</div>
                </div>
              )}
              <div className="pet-detail__attr">
                <div className="pet-detail__attr-label">Age</div>
                <div className="pet-detail__attr-value">{pet.age} year{pet.age !== 1 ? 's' : ''}</div>
              </div>
              <div className="pet-detail__attr">
                <div className="pet-detail__attr-label">ID</div>
                <div className="pet-detail__attr-value">#{pet.id}</div>
              </div>
            </div>

            {pet.description && (
              <p className="pet-detail__desc">{pet.description}</p>
            )}

            <div className="pet-detail__actions">
              {isAdmin() && pet.status === 'AVAILABLE' && (
                <button className="pet-detail__adopt-btn" onClick={handleAdopt}>
                  🏠 Adopt Me!
                </button>
              )}
              {isAdmin() && (
                <>
                  <button
                    className="pet-detail__edit-btn"
                    onClick={() => navigate(`/admin/${id}`)}
                  >
                    ✏️ Edit
                  </button>
                  <button className="pet-detail__delete-btn" onClick={handleDelete}>
                    🗑 Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
