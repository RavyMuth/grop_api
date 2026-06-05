export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message } = body || {}

  if (!message) {
    throw createError({ statusCode: 400, message: 'Message is required' })
  }

  const apiBase = useRuntimeConfig().public.apiBase
  const response = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    throw createError({
      statusCode: response.status,
      message: data.error || 'Upstream error',
    })
  }

  return data
})
