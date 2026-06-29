import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/shared/Logo'

export default function Item() {
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
        <p className="text-[#6a6a6a]">Item detail — coming in Phase 2.</p>
      </main>
    </div>
  )
}
