import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoadingScreen from './components/LoadingScreen'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Challenges from './pages/Challenges'
import ChallengeDetail from './pages/ChallengeDetail'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import AdminPanel from './pages/AdminPanel'
import Analytics from './pages/Analytics'
import CTFMode from './pages/CTFMode'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/autentificare" replace />
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return isAdmin ? children : <Navigate to="/dashboard" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />
  return (
    <>
      <div className="scan-line" />
      <div className="matrix-bg" />
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/autentificare" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/inregistrare" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/exercitii" element={<PrivateRoute><Layout><Challenges /></Layout></PrivateRoute>} />
        <Route path="/exercitii/:id" element={<PrivateRoute><Layout><ChallengeDetail /></Layout></PrivateRoute>} />
        <Route path="/profil" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/clasament" element={<PrivateRoute><Layout><Leaderboard /></Layout></PrivateRoute>} />
        <Route path="/ctf" element={<PrivateRoute><Layout><CTFMode /></Layout></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Layout><AdminPanel /></Layout></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Layout><Analytics /></Layout></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
