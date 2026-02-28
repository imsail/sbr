import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          🐾 <span>Paw</span>Store
        </Link>

        <ul className="navbar__links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/pets">All Pets</NavLink></li>
          {isAdmin() && <li><NavLink to="/users">Users</NavLink></li>}
        </ul>

        <div className="navbar__actions">
          {user ? (
            <>
              {isAdmin() && (
                <Link to="/admin" className="navbar__btn">+ Add Pet</Link>
              )}
              <div className="navbar__user">
                <span className="navbar__username">
                  {isAdmin() ? '🔑' : '👤'} {user.username}
                </span>
                <button className="navbar__logout" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar__link-btn">Login</Link>
              <Link to="/register" className="navbar__btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
