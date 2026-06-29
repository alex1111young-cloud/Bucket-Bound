import Logo from '../components/shared/Logo'

export default function Leaderboard() {
  return (
    <div className="min-h-[100dvh] bg-white">
      <nav className="border-b border-[#f2f2f2] sticky top-0 z-[100] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center">
          <Logo />
        </div>
      </nav>
      <main className="max-w-[1280px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#222222] tracking-tight2 mb-2">Leaderboard</h1>
        <p className="text-[#6a6a6a]">School, city, and friend rankings — coming in Phase 3.</p>
      </main>
    </div>
  )
}
