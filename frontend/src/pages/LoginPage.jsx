import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()
  const from      = location.state?.from || '/'

  const [form, setForm]   = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.status === 401
        ? 'Invalid username or password.'
        : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-card__icon">🐾</span>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__sub">Sign in to your PawStore account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <label>Username</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="your username"
              value={form.username}
              onChange={e => set('username', e.target.value)}
            />
          </div>

          <div className="auth-form__group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="auth-card__hint">
          <p>Demo credentials:</p>
          <p><strong>admin</strong> / admin123 &nbsp;·&nbsp; <strong>customer</strong> / customer123</p>
        </div>
      </div>
    </div>
  )
}
