import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#ff385c] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/" replace />
  return children
}
