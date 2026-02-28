import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">🐾 <span>PawStore</span></div>
            <p className="footer__desc">
              Find your perfect furry, feathered, or scaly companion.
              Every pet deserves a loving home.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/pets">All Pets</Link></li>
              <li><Link to="/pets?status=AVAILABLE">Available Pets</Link></li>
              <li><Link to="/admin">Add a Pet</Link></li>
            </ul>
          </div>

          <div>
            <h4>Categories</h4>
            <ul>
              <li><Link to="/pets?categoryId=1">Dogs 🐶</Link></li>
              <li><Link to="/pets?categoryId=2">Cats 🐱</Link></li>
              <li><Link to="/pets?categoryId=3">Birds 🦜</Link></li>
              <li><Link to="/pets?categoryId=4">Fish 🐠</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          &copy; {new Date().getFullYear()} PawStore. Built with Spring Boot + React.
        </div>
      </div>
    </footer>
  )
}
