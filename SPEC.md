# BUCKET BOUND — SPEC.md
> Read this file at the start of every Claude Code session before writing any code.

---

## What We're Building

Bucket Bound is the "Strava for bucket lists" — a platform where people build their bucket list, plan how to execute each item with AI, journal their journey, and share completions with a social network. The core loop: **add an item → plan it → do it → journal it → share it → inspire others.**

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Tailwind CSS |
| Backend / Auth / DB | Supabase |
| File Storage | Supabase Storage |
| AI | Claude API (claude-sonnet-4-6) |
| Payments | Stripe |
| Hosting | Netlify |

---

## Project Structure

```
bucket-bound/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── items/
│   │   ├── journal/
│   │   ├── profile/
│   │   ├── social/
│   │   ├── ai/
│   │   └── shared/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── Item.jsx
│   │   ├── Discover.jsx
│   │   └── Leaderboard.jsx
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── claude.js
│   │   └── stripe.js
│   ├── styles/
│   └── App.jsx
├── SPEC.md
├── .env
└── netlify.toml
```

---

## Supabase Schema

### users
```sql
id uuid primary key references auth.users
username text unique
full_name text
avatar_url text
bio text
age_range text -- '18-24', '25-34', '35-44', '45+'
interests text[] -- ['adventure', 'travel', 'food', 'skill', 'life']
budget_range text -- 'low', 'medium', 'high', 'unlimited'
is_public boolean default true
created_at timestamptz default now()
```

### bucket_items
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references users(id)
title text
description text
category text -- 'adventure', 'travel', 'food', 'skill', 'life'
status text default 'not_started' -- 'not_started', 'in_progress', 'done'
difficulty int -- 1-5, AI assessed
estimated_cost numeric
target_date date
completed_at timestamptz
is_public boolean default true
created_at timestamptz default now()
```

### journal_entries
```sql
id uuid primary key default gen_random_uuid()
item_id uuid references bucket_items(id)
user_id uuid references users(id)
content text
photo_url text
vibe text -- 'excited', 'nervous', 'proud', 'grateful', 'adventurous'
created_at timestamptz default now()
```

### ai_plans
```sql
id uuid primary key default gen_random_uuid()
item_id uuid references bucket_items(id)
user_id uuid references users(id)
plan jsonb -- {steps, cost_breakdown, best_time, difficulty, gear}
created_at timestamptz default now()
```

### ai_suggestions
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references users(id)
title text
reason text
category text
status text default 'pending' -- 'pending', 'accepted', 'dismissed'
created_at timestamptz default now()
```

### follows
```sql
id uuid primary key default gen_random_uuid()
follower_id uuid references users(id)
following_id uuid references users(id)
created_at timestamptz default now()
```

### reactions
```sql
id uuid primary key default gen_random_uuid()
item_id uuid references bucket_items(id)
user_id uuid references users(id)
type text default 'inspired'
created_at timestamptz default now()
```

### firsts
```sql
id uuid primary key default gen_random_uuid()
item_id uuid references bucket_items(id)
user_id uuid references users(id)
scope text -- 'school', 'city', 'global'
scope_value text -- 'Clemson University', 'Greenville SC', etc.
created_at timestamptz default now()
```

### completion_cards
```sql
id uuid primary key default gen_random_uuid()
item_id uuid references bucket_items(id)
user_id uuid references users(id)
card_url text
created_at timestamptz default now()
```

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLAUDE_API_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

---

## Feature List & Build Status

### Phase 1 — Foundation
- [ ] Supabase auth (email/password)
- [ ] User onboarding flow (name, photo, age range, interests, budget)
- [ ] Dashboard with list overview
- [ ] Bucket list item CRUD
- [ ] Public profile page (bucketbound.app/username)

### Phase 2 — The Hook
- [ ] AI Planner (per item: steps, cost, gear, best time, difficulty)
- [ ] Free tier: 3 AI plans/month gate
- [ ] Progress journal (text + photo per item)
- [ ] Vibe tags on journal entries
- [ ] Story view on item completion
- [ ] AI Suggestions (5 personalized, accept/dismiss, weekly refresh)
- [ ] Shareable completion card (auto-generated, brandable, TikTok/Instagram sized)

### Phase 3 — Social
- [ ] Follow system
- [ ] Experience feed (friend completions)
- [ ] "Inspired" reaction
- [ ] Discover tab (public completions globally)
- [ ] Firsts badges (first at school/city to complete an item)
- [ ] School leaderboard
- [ ] City leaderboard
- [ ] Friends leaderboard

### Phase 4 — Monetization
- [ ] Stripe premium tier ($6/mo or $50/yr)
- [ ] Premium gates: unlimited AI plans, full journal storage, AI suggestions
- [ ] Affiliate links in AI-generated plans (REI, Viator, GetYourGuide, Skyscanner)
- [ ] Year in Life annual recap (Spotify Wrapped style)

---

## AI Integration

### AI Planner Prompt Template
```
You are an experience planning assistant for Bucket Bound.

User profile:
- Interests: {interests}
- Budget range: {budget_range}
- Age range: {age_range}
- Location: {location}

Generate a detailed execution plan for this bucket list item: "{item_title}"

Respond in JSON only:
{
  "steps": ["step 1", "step 2", ...],
  "cost_breakdown": {"item": amount, ...},
  "total_estimated_cost": number,
  "best_time_of_year": "string",
  "difficulty": 1-5,
  "gear_needed": ["item1", "item2", ...],
  "affiliate_opportunities": ["skydiving", "travel", "gear", etc.]
}
```

### AI Suggestions Prompt Template
```
You are a bucket list advisor for Bucket Bound.

User profile:
- Interests: {interests}
- Budget: {budget_range}
- Age range: {age_range}
- Existing bucket list items: {existing_items}
- Completed items: {completed_items}

Generate 5 personalized bucket list suggestions this user would love but hasn't thought of.

Respond in JSON only:
{
  "suggestions": [
    {
      "title": "string",
      "category": "adventure|travel|food|skill|life",
      "reason": "one sentence why this fits them specifically",
      "estimated_cost": number,
      "difficulty": 1-5
    }
  ]
}
```

---

## Key UX Rules

1. **Profile page is the billboard** — it must be visually stunning. Think achievement wall, not spreadsheet.
2. **Completion card is the growth engine** — every completion generates a beautiful branded card users want to post. Never skip this step.
3. **First "wow" moment must happen in onboarding** — the first AI suggestion shown must feel personal, not generic. Use onboarding data immediately.
4. **Feed shows friends first, then global** — never show an empty feed. Show global completions until the user has follows.
5. **Never block core actions behind premium** — list building, journaling, and basic profile are always free.

---

## Monetization Rules

- Free tier: 3 AI plans/month, 10 journal photos/month, basic profile
- Premium ($6/mo or $50/yr): unlimited AI plans, unlimited journal storage, AI suggestions, priority feed placement
- Affiliate links: insert contextually inside AI-generated plans only, never intrusive
- Platform fee: 3% on any registry contributions (V2)

---

## Brand

- **Tagline:** "Log your life."
- **Tone:** Bold, warm, aspirational. Never corporate. Think Jesse Itzler meets Strava.
- **Colors:** TBD — lean toward deep navy + bright coral or amber. Feels adventurous, not sterile.
- **Typography:** Clean sans-serif, generous whitespace, large imagery.

---

## Founders

- **Alex Young** — Clemson University, Physics + Math. Builder. Leads product and engineering.
- **Keenan Carter** — University at Buffalo, Business/Marketing. Leads growth and brand.

---

## Current Build Session

> Update this section at the start of each Claude Code session with what was last completed and what we're working on today.

**Last completed:** Nothing yet — project not started.
**Working on today:** [UPDATE THIS]
**Blockers:** [UPDATE THIS]

---

## Notes & Decisions Log

- Name TBD — candidates: Crossed, Listlived, Markd, Bucket Bound
- Dare Board feature deprioritized — economics don't work for users at small scale
- Registry deprioritized — needs vendor integration to work properly, V2
- Cold start strategy: seed Clemson + UB networks before public launch
- Frequency problem mitigation: journal and feed give daily reasons to open app beyond completions
