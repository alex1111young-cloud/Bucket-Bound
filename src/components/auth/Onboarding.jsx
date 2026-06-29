import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Logo from '../shared/Logo'

const STEPS = ['name', 'photo', 'age', 'interests', 'budget']

const INTERESTS = [
  { id: 'adventure', label: 'Adventure', icon: '🧗', desc: 'Skydiving, hiking, extreme sports' },
  { id: 'travel', label: 'Travel', icon: '✈️', desc: 'New countries, road trips, cultures' },
  { id: 'food', label: 'Food', icon: '🍜', desc: 'Restaurants, cooking, cuisine' },
  { id: 'skill', label: 'Skills', icon: '🎸', desc: 'Learn instruments, languages, crafts' },
  { id: 'life', label: 'Life', icon: '🌱', desc: 'Relationships, milestones, experiences' },
]

const AGE_RANGES = ['18-24', '25-34', '35-44', '45+']

const BUDGET_RANGES = [
  { id: 'low', label: 'Budget', desc: 'Under $100 per item', color: 'text-green-700 bg-green-50 border-green-200' },
  { id: 'medium', label: 'Mid-range', desc: '$100–$1,000 per item', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'high', label: 'Premium', desc: '$1,000–$10,000 per item', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'unlimited', label: 'Unlimited', desc: 'Money is no object', color: 'text-[#ff385c] bg-[#ff385c]/5 border-[#ff385c]/20' },
]

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [ageRange, setAgeRange] = useState('')
  const [interests, setInterests] = useState([])
  const [budgetRange, setBudgetRange] = useState('')

  const currentStep = STEPS[step]
  const progress = ((step) / (STEPS.length)) * 100

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function toggleInterest(id) {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function canAdvance() {
    if (currentStep === 'name') return fullName.trim().length >= 2 && username.trim().length >= 2
    if (currentStep === 'photo') return true // optional
    if (currentStep === 'age') return ageRange !== ''
    if (currentStep === 'interests') return interests.length >= 1
    if (currentStep === 'budget') return budgetRange !== ''
    return true
  }

  async function handleFinish() {
    setSaving(true)
    setError('')

    let avatarUrl = null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    const { error: upsertError } = await supabase.from('users').upsert({
      id: user.id,
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      avatar_url: avatarUrl,
      age_range: ageRange,
      interests,
      budget_range: budgetRange,
    })

    if (upsertError) {
      setError(upsertError.message)
      setSaving(false)
      return
    }

    await refreshProfile()
    navigate('/dashboard')
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleFinish()
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-[#f2f2f2]">
        <Logo />
        <span className="text-sm text-[#6a6a6a]">Step {step + 1} of {STEPS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#f2f2f2]">
        <div
          className="h-full bg-[#ff385c] transition-all duration-500 ease-out"
          style={{ width: `${progress + (100 / STEPS.length)}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md fade-up" key={step}>

          {/* STEP: Name */}
          {currentStep === 'name' && (
            <div>
              <h2 className="text-3xl font-bold text-[#222222] tracking-tight2 mb-2">What's your name?</h2>
              <p className="text-[#6a6a6a] mb-8">This is how you'll appear to the community.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Alex Young"
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c1c1c1] font-medium">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                      placeholder="alexyoung"
                      className="input-field pl-8"
                    />
                  </div>
                  <p className="text-xs text-[#6a6a6a] mt-1.5">bucketbound.app/{username || 'username'}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Photo */}
          {currentStep === 'photo' && (
            <div>
              <h2 className="text-3xl font-bold text-[#222222] tracking-tight2 mb-2">Add a photo</h2>
              <p className="text-[#6a6a6a] mb-8">Profiles with photos get 3× more connection requests. (Optional)</p>

              <div className="flex flex-col items-center gap-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full border-2 border-dashed border-[#c1c1c1] flex items-center justify-center cursor-pointer hover:border-[#ff385c] hover:bg-[#ff385c]/5 transition-all duration-200 overflow-hidden"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#c1c1c1]">
                      <Camera size={28} />
                      <span className="text-xs font-medium">Upload photo</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {avatarPreview && (
                  <button
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                    className="text-sm text-[#6a6a6a] hover:text-[#ff385c] transition-colors"
                  >
                    Remove photo
                  </button>
                )}

                {!avatarPreview && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-ghost"
                  >
                    Choose photo
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP: Age range */}
          {currentStep === 'age' && (
            <div>
              <h2 className="text-3xl font-bold text-[#222222] tracking-tight2 mb-2">How old are you?</h2>
              <p className="text-[#6a6a6a] mb-8">Helps us personalize your bucket list suggestions.</p>
              <div className="grid grid-cols-2 gap-3">
                {AGE_RANGES.map(range => (
                  <button
                    key={range}
                    onClick={() => setAgeRange(range)}
                    className={`py-4 rounded-card border-2 font-semibold text-lg transition-all duration-200 ${
                      ageRange === range
                        ? 'border-[#ff385c] bg-[#ff385c]/5 text-[#ff385c]'
                        : 'border-[#c1c1c1] text-[#222222] hover:border-[#222222]'
                    }`}
                  >
                    {range}
                    {ageRange === range && (
                      <Check size={16} className="inline ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Interests */}
          {currentStep === 'interests' && (
            <div>
              <h2 className="text-3xl font-bold text-[#222222] tracking-tight2 mb-2">What excites you?</h2>
              <p className="text-[#6a6a6a] mb-8">Select all that apply — your AI suggestions will be personalized to these.</p>
              <div className="space-y-3">
                {INTERESTS.map(interest => {
                  const selected = interests.includes(interest.id)
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-card border-2 text-left transition-all duration-200 ${
                        selected
                          ? 'border-[#ff385c] bg-[#ff385c]/5'
                          : 'border-[#f2f2f2] hover:border-[#c1c1c1]'
                      }`}
                    >
                      <span className="text-2xl">{interest.icon}</span>
                      <div className="flex-1">
                        <p className={`font-semibold ${selected ? 'text-[#ff385c]' : 'text-[#222222]'}`}>
                          {interest.label}
                        </p>
                        <p className="text-sm text-[#6a6a6a]">{interest.desc}</p>
                      </div>
                      {selected && <Check size={18} className="text-[#ff385c] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP: Budget */}
          {currentStep === 'budget' && (
            <div>
              <h2 className="text-3xl font-bold text-[#222222] tracking-tight2 mb-2">What's your typical budget?</h2>
              <p className="text-[#6a6a6a] mb-8">For a bucket list item. This shapes your AI-generated plans.</p>
              <div className="space-y-3">
                {BUDGET_RANGES.map(b => {
                  const selected = budgetRange === b.id
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBudgetRange(b.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-card border-2 text-left transition-all duration-200 ${
                        selected
                          ? `border-[#ff385c] bg-[#ff385c]/5`
                          : 'border-[#f2f2f2] hover:border-[#c1c1c1]'
                      }`}
                    >
                      <div>
                        <p className={`font-semibold ${selected ? 'text-[#ff385c]' : 'text-[#222222]'}`}>
                          {b.label}
                        </p>
                        <p className="text-sm text-[#6a6a6a]">{b.desc}</p>
                      </div>
                      {selected && <Check size={18} className="text-[#ff385c] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-[#ff385c] bg-[#ff385c]/5 border border-[#ff385c]/20 rounded-btn px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={back}
              disabled={step === 0}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                step === 0 ? 'text-[#c1c1c1] cursor-not-allowed' : 'text-[#6a6a6a] hover:text-[#222222]'
              }`}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <button
              onClick={next}
              disabled={!canAdvance() || saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {step === STEPS.length - 1 ? "Let's go" : 'Continue'}
              {step < STEPS.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
