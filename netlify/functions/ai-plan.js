export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.VITE_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are an experience planning assistant for Bucket Bound. Respond in JSON only.',
      messages: [{ role: 'user', content: body.prompt }],
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Claude API error' }), { status: 500 })
  }

  const data = await response.json()
  return new Response(data.content[0].text, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

export const config = { path: '/api/ai-plan' }
