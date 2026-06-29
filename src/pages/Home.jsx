import AuthForm from '../components/auth/AuthForm'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function Home() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />

  return <AuthForm />
}
