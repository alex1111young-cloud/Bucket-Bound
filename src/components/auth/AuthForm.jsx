import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Logo from '../shared/Logo'

export default function AuthForm() {
  const [mode, setMode] = useState('signup') // 'signup' | 'signin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    } else {
      const { data, error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.user.id)
          .single()
        navigate(profile?.username ? '/dashboard' : '/onboarding')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left panel — hero */}
      <div className="hidden lg:flex flex-1 bg-[#222222] relative overflow-hidden items-end p-12">
        <img
          src="https://picsum.photos/seed/bucketbound/900/1200"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-md">
          <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-4">Bucket Bound</p>
          <h2 className="text-white text-4xl font-bold leading-tight tracking-tight2 mb-4">
            Your life is the<br />greatest adventure.
          </h2>
          <p className="text-white/70 text-lg">
            Build your bucket list. Plan every item with AI. Journal the journey. Share completions that inspire others.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 max-w-lg lg:max-w-none lg:w-[480px] mx-auto lg:mx-0">
        <div className="fade-up">
          <div className="mb-10">
            <Logo size="lg" />
            <p className="text-[#6a6a6a] mt-2 text-base">Log your life.</p>
          </div>

          <h1 className="text-2xl font-bold text-[#222222] tracking-tight1 mb-8">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c1c1c1]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c1c1c1]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-[#222222] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#ff385c] bg-[#ff385c]/5 border border-[#ff385c]/20 rounded-btn px-4 py-2.5">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-btn px-4 py-2.5">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#f2f2f2] text-center">
            {mode === 'signup' ? (
              <p className="text-[#6a6a6a] text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
                  className="text-[#ff385c] font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-[#6a6a6a] text-sm">
                No account yet?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                  className="text-[#ff385c] font-semibold hover:underline"
                >
                  Sign up free
                </button>
              </p>
            )}
          </div>

          <p className="text-xs text-[#c1c1c1] text-center mt-6">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
