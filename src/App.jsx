import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Prospects from './pages/Prospects'
import Users from './pages/Users'
import Import from './pages/Import'
import Integrations from './pages/Integrations'

function PrivateRoute({ children, masterOnly = false }) {
  const { user, loading, isMaster } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500 text-sm">Cargando...</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (masterOnly && !isMaster) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500 text-sm">Cargando...</div></div>
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Prospects />} />
        <Route path="usuarios" element={<PrivateRoute masterOnly><Users /></PrivateRoute>} />
        <Route path="importar-excel" element={<Import />} />
        <Route path="integraciones" element={<Integrations />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
