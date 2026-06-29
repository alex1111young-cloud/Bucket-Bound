import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Sparkles, CheckCircle, Circle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { generatePlan } from '../lib/claude'
import Nav from '../components/shared/Nav'

const CATEGORIES = ['adventure', 'travel', 'food', 'skill', 'life']
const STATUS_ICONS = {
  not_started: <Circle size={16} className="text-[#c1c1c1]" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  done: <CheckCircle size={16} className="text-green-500" />,
}

export default function Dashboard() {
  const { profile, user } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [expandedItem, setExpandedItem] = useState(null)
  const [planLoading, setPlanLoading] = useState(null)

  // New item form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('adventure')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (user) fetchItems()
  }, [user])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase
      .from('bucket_items')
      .select('*, ai_plans(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function addItem(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setFormError('')

    const { error } = await supabase.from('bucket_items').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      status: 'not_started',
    })

    if (error) {
      setFormError(error.message)
      setSaving(false)
      return
    }

    setTitle('')
    setDescription('')
    setCategory('adventure')
    setShowModal(false)
    setSaving(false)
    fetchItems()
  }

  async function updateStatus(itemId, status) {
    await supabase
      .from('bucket_items')
      .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
      .eq('id', itemId)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i))
  }

  async function deleteItem(itemId) {
    await supabase.from('bucket_items').delete().eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
    if (expandedItem === itemId) setExpandedItem(null)
  }

  async function getAIPlan(item) {
    if (!import.meta.env.VITE_CLAUDE_API_KEY) {
      alert('Add your VITE_CLAUDE_API_KEY to .env to use AI planning.')
      return
    }
    setPlanLoading(item.id)
    try {
      const plan = await generatePlan(item, profile)
      const { error } = await supabase.from('ai_plans').upsert({
        item_id: item.id,
        user_id: user.id,
        plan,
      })
      if (!error) fetchItems()
    } catch (err) {
      // Try to get more detail from the response
      alert('AI plan failed: ' + (err.message || JSON.stringify(err)))
    }
    setPlanLoading(null)
  }

  const done = items.filter(i => i.status === 'done').length

  return (
    <div className="min-h-[100dvh] bg-[#f2f2f2]">
      <Nav />

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <div className="fade-up">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#222222] tracking-tight2">
                {profile ? `${profile.full_name?.split(' ')[0]}'s bucket list` : 'Your bucket list'}
              </h1>
              <p className="text-[#6a6a6a] mt-1">
                {items.length === 0 ? 'Nothing yet — add your first item.' : `${done} of ${items.length} completed`}
              </p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              Add item
            </button>
          </div>

          {/* Items list */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-card" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="card p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff385c]/10 flex items-center justify-center mb-4">
                <Plus size={28} className="text-[#ff385c]" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-2">Start your list</h3>
              <p className="text-[#6a6a6a] text-sm mb-6 max-w-sm">
                Add your first bucket list item and let AI build you a complete action plan.
              </p>
              <button onClick={() => setShowModal(true)} className="btn-primary">Add your first item</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => {
                const plan = item.ai_plans?.[0]?.plan
                const isExpanded = expandedItem === item.id
                return (
                  <div key={item.id} className="card overflow-hidden">
                    {/* Item row */}
                    <div className="p-5 flex items-start gap-4">
                      {/* Status toggle */}
                      <div className="mt-0.5">
                        <select
                          value={item.status}
                          onChange={e => updateStatus(item.id, e.target.value)}
                          className="sr-only"
                        />
                        <button
                          onClick={() => {
                            const next = item.status === 'not_started' ? 'in_progress'
                              : item.status === 'in_progress' ? 'done' : 'not_started'
                            updateStatus(item.id, next)
                          }}
                          title="Click to cycle status"
                        >
                          {STATUS_ICONS[item.status]}
                        </button>
                      </div>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-[#222222] ${item.status === 'done' ? 'line-through text-[#6a6a6a]' : ''}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-[#6a6a6a] capitalize bg-[#f2f2f2] px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-xs text-[#6a6a6a] capitalize">{item.status.replace('_', ' ')}</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-[#6a6a6a] mt-1.5 line-clamp-2">{item.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!plan && (
                          <button
                            onClick={() => getAIPlan(item)}
                            disabled={planLoading === item.id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#ff385c] border border-[#ff385c]/30 px-3 py-1.5 rounded-btn hover:bg-[#ff385c]/5 transition-all disabled:opacity-50"
                          >
                            {planLoading === item.id ? (
                              <span className="w-3 h-3 border border-[#ff385c] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            AI Plan
                          </button>
                        )}
                        {plan && (
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#6a6a6a] border border-[#c1c1c1] px-3 py-1.5 rounded-btn hover:bg-[#f2f2f2] transition-all"
                          >
                            Plan {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-[#c1c1c1] hover:text-[#ff385c] transition-colors p-1"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* AI Plan expanded */}
                    {isExpanded && plan && (
                      <div className="border-t border-[#f2f2f2] p-5 bg-[#f2f2f2]/50">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={14} className="text-[#ff385c]" />
                          <span className="text-sm font-semibold text-[#222222]">AI Action Plan</span>
                          {plan.total_estimated_cost && (
                            <span className="ml-auto text-sm font-semibold text-[#222222]">
                              ~${plan.total_estimated_cost.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {plan.steps?.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">Steps</p>
                            <ol className="space-y-1.5">
                              {plan.steps.map((step, i) => (
                                <li key={i} className="flex gap-2.5 text-sm text-[#222222]">
                                  <span className="text-[#ff385c] font-bold shrink-0">{i + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {plan.best_time_of_year && (
                            <div>
                              <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1">Best time</p>
                              <p className="text-[#222222]">{plan.best_time_of_year}</p>
                            </div>
                          )}
                          {plan.difficulty && (
                            <div>
                              <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1">Difficulty</p>
                              <p className="text-[#222222]">{'★'.repeat(plan.difficulty)}{'☆'.repeat(5 - plan.difficulty)}</p>
                            </div>
                          )}
                          {plan.gear_needed?.length > 0 && (
                            <div className="col-span-2">
                              <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1">Gear needed</p>
                              <p className="text-[#222222]">{plan.gear_needed.join(', ')}</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => getAIPlan(item)}
                          disabled={planLoading === item.id}
                          className="mt-4 text-xs text-[#6a6a6a] hover:text-[#ff385c] transition-colors"
                        >
                          Regenerate plan
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add item modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#222222]/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-card shadow-lift w-full max-w-md p-6 fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#222222] tracking-tight1">Add bucket list item</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6a6a6a] hover:text-[#222222] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1.5">What do you want to do?</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Skydive over the Grand Canyon"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                        category === cat
                          ? 'bg-[#ff385c] text-white'
                          : 'bg-[#f2f2f2] text-[#6a6a6a] hover:bg-[#e8e8e8]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1.5">Notes <span className="text-[#c1c1c1] font-normal">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Any details, context, or why this matters to you..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {formError && (
                <p className="text-sm text-[#ff385c]">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !title.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Add item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
