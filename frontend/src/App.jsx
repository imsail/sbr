import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage      from './pages/HomePage'
import PetsPage      from './pages/PetsPage'
import PetDetailPage from './pages/PetDetailPage'
import AdminPage     from './pages/AdminPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import UsersPage     from './pages/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/pets"      element={<PetsPage />} />
            <Route path="/pets/:id"  element={<PetDetailPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>
            }/>
            <Route path="/admin/:id" element={
              <ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>
            }/>
            <Route path="/users" element={
              <ProtectedRoute requireAdmin><UsersPage /></ProtectedRoute>
            }/>
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}
