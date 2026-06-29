async function callClaude(prompt) {
  const res = await fetch('/api/ai-plan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `AI request failed: ${res.status}`)
  }
  return res.json()
}

export async function generatePlan(item, userProfile) {
  const prompt = `User profile:
- Interests: ${userProfile.interests?.join(', ')}
- Budget range: ${userProfile.budget_range}
- Age range: ${userProfile.age_range}

Generate a detailed execution plan for this bucket list item: "${item.title}"

Respond in JSON only:
{
  "steps": ["step 1", "step 2"],
  "cost_breakdown": {"item": 0},
  "total_estimated_cost": 0,
  "best_time_of_year": "string",
  "difficulty": 3,
  "gear_needed": ["item1"],
  "affiliate_opportunities": ["travel"]
}`

  return callClaude(prompt)
}

export async function generateSuggestions(userProfile, existingItems, completedItems) {
  const prompt = `User profile:
- Interests: ${userProfile.interests?.join(', ')}
- Budget: ${userProfile.budget_range}
- Age range: ${userProfile.age_range}
- Existing bucket list items: ${existingItems.join(', ')}
- Completed items: ${completedItems.join(', ')}

Generate 5 personalized bucket list suggestions this user would love but hasn't thought of.

Respond in JSON only:
{
  "suggestions": [
    {
      "title": "string",
      "category": "adventure",
      "reason": "one sentence why this fits them",
      "estimated_cost": 0,
      "difficulty": 3
    }
  ]
}`

  return callClaude(prompt)
}
