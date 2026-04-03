import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) { setError('Correo o contraseña incorrectos.'); setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ACA PActners</h1>
          <p className="text-sm text-gray-500 mt-1">CRM de Reclutamiento</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Correo electrónico</label><input type="email" className="input" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div><label className="label">Contraseña</label><input type="password" className="input" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
            {error&&<p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">{loading?'Iniciando sesión...':'Iniciar sesión'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
