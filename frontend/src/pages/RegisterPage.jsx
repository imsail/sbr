import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate    = useNavigate()
  const { register } = useAuth()

  const [form, setForm]   = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register({ username: form.username, email: form.email, password: form.password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message
        || err.response?.data
        || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-card__icon">🐾</span>
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__sub">Join PawStore and find your perfect pet</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <label>Username</label>
            <input
              type="text"
              required
              minLength={3}
              autoFocus
              placeholder="choose a username"
              value={form.username}
              onChange={e => set('username', e.target.value)}
            />
          </div>

          <div className="auth-form__group">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </div>

          <div className="auth-form__group">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="at least 6 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
          </div>

          <div className="auth-form__group">
            <label>Confirm Password</label>
            <input
              type="password"
              required
              placeholder="repeat password"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
            />
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
