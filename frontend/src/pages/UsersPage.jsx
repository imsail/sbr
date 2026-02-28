import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsers, updateUserRole, deleteUser } from '../services/api'

const FILTERS = ['ALL', 'ADMIN', 'CUSTOMER']

export default function UsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers]     = useState([])
  const [filter, setFilter]   = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState(null)

  const load = () => {
    setLoading(true)
    getUsers().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
    try {
      const updated = await updateUserRole(u.id, newRole)
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x))
      showToast(`${u.username} is now ${newRole}.`)
    } catch (err) {
      showToast(err.response?.data || 'Failed to update role.', 'error')
    }
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return
    try {
      await deleteUser(u.id)
      setUsers(prev => prev.filter(x => x.id !== u.id))
      showToast(`${u.username} deleted.`)
    } catch (err) {
      showToast(err.response?.data || 'Failed to delete user.', 'error')
    }
  }

  const filtered = filter === 'ALL' ? users : users.filter(u => u.role === filter)

  return (
    <div className="users-page">
      <div className="container">
        <div className="users-page__header">
          <div>
            <h1>User Management</h1>
            <p>{users.length} total user{users.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="users-page__filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`users-page__filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="users-page__empty">No users found.</div>
        ) : (
          <div className="users-table">
            <div className="users-table__head">
              <span>User</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>
            {filtered.map(u => (
              <div key={u.id} className="users-table__row">
                <div className="users-table__user">
                  <div className="users-table__avatar" data-role={u.role}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="users-table__name">
                      {u.username}
                      {u.username === me?.username && <span className="users-table__you">you</span>}
                    </div>
                    <div className="users-table__id">#{u.id}</div>
                  </div>
                </div>

                <div className="users-table__email">{u.email}</div>

                <div>
                  <span className={`users-table__role users-table__role--${u.role}`}>
                    {u.role === 'ADMIN' ? '🔑 Admin' : '👤 Customer'}
                  </span>
                </div>

                <div className="users-table__date">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>

                <div className="users-table__actions">
                  {u.username !== me?.username && (
                    <>
                      <button
                        className="users-table__btn users-table__btn--role"
                        onClick={() => handleRoleToggle(u)}
                        title={u.role === 'ADMIN' ? 'Demote to Customer' : 'Promote to Admin'}
                      >
                        {u.role === 'ADMIN' ? '↓ Demote' : '↑ Promote'}
                      </button>
                      <button
                        className="users-table__btn users-table__btn--delete"
                        onClick={() => handleDelete(u)}
                        title="Delete user"
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
