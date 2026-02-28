import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PetsPage from './pages/PetsPage'
import PetDetailPage from './pages/PetDetailPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/pets"       element={<PetsPage />} />
          <Route path="/pets/:id"   element={<PetDetailPage />} />
          <Route path="/admin"      element={<AdminPage />} />
          <Route path="/admin/:id"  element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
