import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, CheckCircle, Compass } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Logo from '../components/shared/Logo'
import Nav from '../components/shared/Nav'

const DEMO_POSTS = [
  {
    id: 'demo-1',
    user: { full_name: 'Broden Haessig', username: 'brodenhaessig', avatar: 'https://picsum.photos/seed/broden/200/200' },
    title: 'Skydive over the Swiss Alps',
    category: 'adventure',
    completed_at: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
    photo: 'https://picsum.photos/seed/skydive/800/500',
    inspired: 47,
    isDemo: true,
  },
  {
    id: 'demo-2',
    user: { full_name: 'Rober Haessig', username: 'roberhaessig', avatar: 'https://picsum.photos/seed/rober/200/200' },
    title: 'Eat at a 3 Michelin star restaurant',
    category: 'food',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    photo: 'https://picsum.photos/seed/restaurant/800/500',
    inspired: 31,
    isDemo: true,
  },
  {
    id: 'demo-3',
    user: { full_name: 'Marrison Haessig', username: 'marrisonhaessig', avatar: 'https://picsum.photos/seed/marrison/200/200' },
    title: 'Hike the Appalachian Trail end-to-end',
    category: 'adventure',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    photo: 'https://picsum.photos/seed/appalachian/800/500',
    inspired: 112,
    isDemo: true,
  },
  {
    id: 'demo-4',
    user: { full_name: 'Broden Haessig', username: 'brodenhaessig', avatar: 'https://picsum.photos/seed/broden/200/200' },
    title: 'Learn to surf in Bali',
    category: 'skill',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    photo: 'https://picsum.photos/seed/surfbali/800/500',
    inspired: 88,
    isDemo: true,
  },
  {
    id: 'demo-5',
    user: { full_name: 'Rober Haessig', username: 'roberhaessig', avatar: 'https://picsum.photos/seed/rober/200/200' },
    title: 'See the Northern Lights in Iceland',
    category: 'travel',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    photo: 'https://picsum.photos/seed/northernlights/800/500',
    inspired: 203,
    isDemo: true,
  },
  {
    id: 'demo-6',
    user: { full_name: 'Marrison Haessig', username: 'marrisonhaessig', avatar: 'https://picsum.photos/seed/marrison/200/200' },
    title: 'Write and publish a novel',
    category: 'skill',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    photo: null,
    inspired: 56,
    isDemo: true,
  },
]

const CATEGORY_COLORS = {
  adventure: 'bg-orange-50 text-orange-700',
  travel: 'bg-blue-50 text-blue-700',
  food: 'bg-yellow-50 text-yellow-700',
  skill: 'bg-purple-50 text-purple-700',
  life: 'bg-green-50 text-green-700',
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function PostCard({ post, onInspire, inspired }) {
  return (
    <div className="card overflow-hidden fade-up">
      {/* Header */}
      <div className="p-5 flex items-center gap-3">
        <img
          src={post.user.avatar || `https://picsum.photos/seed/${post.user.username}/200/200`}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#222222] text-sm">{post.user.full_name}</p>
          <p className="text-xs text-[#6a6a6a]">@{post.user.username} · {timeAgo(post.completed_at)}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <CheckCircle size={12} />
          Completed
        </div>
      </div>

      {/* Photo */}
      {post.photo && (
        <div className="aspect-[16/9] overflow-hidden">
          <img src={post.photo} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <p className="font-bold text-[#222222] text-lg leading-snug tracking-tight1 mb-2">
          {post.title}
        </p>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${CATEGORY_COLORS[post.category] || 'bg-[#f2f2f2] text-[#6a6a6a]'}`}>
          {post.category}
        </span>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center gap-4">
        <button
          onClick={() => onInspire(post.id)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
            inspired
              ? 'text-[#ff385c]'
              : 'text-[#6a6a6a] hover:text-[#ff385c]'
          }`}
        >
          <Heart size={16} fill={inspired ? '#ff385c' : 'none'} />
          {(post.inspired || 0) + (inspired ? 1 : 0)} inspired
        </button>
      </div>
    </div>
  )
}

export default function Feed() {
  const { user } = useAuth()
  const [realPosts, setRealPosts] = useState([])
  const [inspired, setInspired] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealPosts()
  }, [])

  async function fetchRealPosts() {
    const { data } = await supabase
      .from('bucket_items')
      .select('*, users(full_name, username, avatar_url)')
      .eq('status', 'done')
      .eq('is_public', true)
      .neq('user_id', user?.id)
      .order('completed_at', { ascending: false })
      .limit(20)

    if (data) {
      setRealPosts(data.map(item => ({
        id: item.id,
        user: {
          full_name: item.users?.full_name,
          username: item.users?.username,
          avatar: item.users?.avatar_url,
        },
        title: item.title,
        category: item.category,
        completed_at: item.completed_at,
        photo: null,
        inspired: 0,
        isReal: true,
      })))
    }
    setLoading(false)
  }

  function toggleInspire(id) {
    setInspired(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const allPosts = [...realPosts, ...DEMO_POSTS]

  return (
    <div className="min-h-[100dvh] bg-[#f2f2f2]">
      <Nav />

      <main className="max-w-[600px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222] tracking-tight2">Feed</h1>
          <p className="text-[#6a6a6a] mt-1">See what the community is crossing off.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="skeleton h-80 rounded-card" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {allPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onInspire={toggleInspire}
                inspired={!!inspired[post.id]}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
