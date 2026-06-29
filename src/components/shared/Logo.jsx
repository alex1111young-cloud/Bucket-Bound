export default function Logo({ size = 'md' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }
  return (
    <span className={`font-bold tracking-tight2 text-[#222222] ${sizes[size]}`}>
      Bucket<span className="text-[#ff385c]">Bound</span>
    </span>
  )
}
