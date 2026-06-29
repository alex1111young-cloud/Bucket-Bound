import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import Logo from '../components/shared/Logo'

export default function Profile() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-white">
      <nav className="border-b border-[#f2f2f2] sticky top-0 z-[100] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-[#6a6a6a] hover:text-[#222222] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <Logo />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="fade-up text-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-card" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-4">
              <User size={36} className="text-[#c1c1c1]" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#222222] tracking-tight2">{profile?.full_name}</h1>
          <p className="text-[#6a6a6a]">@{profile?.username}</p>
          {profile?.bio && <p className="text-[#222222] mt-3 max-w-md mx-auto">{profile.bio}</p>}

          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="text-center">
              <p className="font-bold text-[#222222] text-xl">0</p>
              <p className="text-[#6a6a6a]">items</p>
            </div>
            <div className="w-px h-8 bg-[#f2f2f2]" />
            <div className="text-center">
              <p className="font-bold text-[#222222] text-xl">0</p>
              <p className="text-[#6a6a6a]">completed</p>
            </div>
            <div className="w-px h-8 bg-[#f2f2f2]" />
            <div className="text-center">
              <p className="font-bold text-[#222222] text-xl">0</p>
              <p className="text-[#6a6a6a]">followers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
