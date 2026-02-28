import { NavLink, Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          🐾 <span>Paw</span>Store
        </Link>

        <ul className="navbar__links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/pets">All Pets</NavLink></li>
        </ul>

        <div className="navbar__actions">
          <Link to="/admin" className="navbar__btn">+ Add Pet</Link>
        </div>
      </div>
    </nav>
  )
}
