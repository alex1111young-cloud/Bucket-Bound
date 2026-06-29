export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.VITE_CLAUDE_API_KEY || process.env.CLAUDE_API_KEY

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key configured' }), { status: 500 })
  }

  let body
  try {
    body = await req.json()
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: 'You are an experience planning assistant for Bucket Bound. Respond in JSON only.',
      messages: [{ role: 'user', content: body.prompt }],
    }),
  })

  const text = await response.text()

  if (!response.ok) {
    return new Response(JSON.stringify({ error: `Claude ${response.status}: ${text}` }), { status: 500 })
  }

  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad response from Claude' }), { status: 500 })
  }

  // Strip markdown code fences if present
  const raw = data.content[0].text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  return new Response(raw, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

export const config = { path: '/api/ai-plan' }
