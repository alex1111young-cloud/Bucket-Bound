import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutList, Rss, Compass, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Logo from './Logo'

const LINKS = [
  { path: '/dashboard', label: 'My List', icon: LayoutList },
  { path: '/feed', label: 'Feed', icon: Rss },
  { path: '/discover', label: 'Discover', icon: Compass },
]

export default function Nav() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-[#f2f2f2] sticky top-0 z-[100]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden sm:flex items-center gap-1">
            {LINKS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-btn text-sm font-medium transition-all ${
                    active
                      ? 'text-[#ff385c] bg-[#ff385c]/5'
                      : 'text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f2f2f2]'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-[#ff385c] transition-colors"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                <User size={14} className="text-[#6a6a6a]" />
              </div>
            )}
            <span className="hidden sm:block">{profile?.full_name?.split(' ')[0]}</span>
          </button>
          <button onClick={handleSignOut} className="btn-ghost py-2 px-3 flex items-center gap-1.5 text-sm">
            <LogOut size={14} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#f2f2f2] flex z-[100]">
        {LINKS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? 'text-[#ff385c]' : 'text-[#6a6a6a]'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          )
        })}
        <button
          onClick={() => navigate('/profile')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            location.pathname === '/profile' ? 'text-[#ff385c]' : 'text-[#6a6a6a]'
          }`}
        >
          <User size={20} />
          Profile
        </button>
      </div>
    </nav>
  )
}
