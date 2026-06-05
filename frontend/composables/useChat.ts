const state = {
  messages: ref<{ role: string; content: string }[]>([]),
  loading: ref(false),
}

const systemMsg = { role: 'system' as const, content: 'You are a helpful assistant. Be concise and friendly.' }

state.messages.value = [systemMsg, { role: 'assistant', content: 'Hello! Ask me anything.' }]

function saveSession() {
  if (process.client) {
    try {
      sessionStorage.setItem('chat_history', JSON.stringify(state.messages.value))
    } catch {}
  }
}

export const useChat = () => {
  function restoreSession() {
    if (process.client) {
      const saved = sessionStorage.getItem('chat_history')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            state.messages.value = parsed
          }
        } catch {}
      }
    }
  }

  async function sendMessage(text: string, files: File[]) {
    let content = text
    if (files.length) {
      const names = files.map(f => '📎 ' + f.name).join('\n')
      content = names + (text ? '\n' + text : '')
    }

    state.messages.value.push({ role: 'user', content })
    saveSession()

    state.loading.value = true
    try {
      const res = await $fetch('/api/chat', {
        method: 'POST',
        body: { message: content },
      })
      const data = res as { reply?: string }
      if (data.reply) {
        state.messages.value.push({ role: 'assistant', content: data.reply })
      } else {
        throw new Error('Empty response from server')
      }
      saveSession()
      useHistory().saveConversation(state.messages.value)
    } catch (err: any) {
      state.messages.value.push({ role: 'assistant', content: 'Error: ' + (err.message || 'Network error') })
    } finally {
      state.loading.value = false
    }
  }

  function loadConversation(conv: { messages: { role: string; content: string }[]; id: number }) {
    state.messages.value = [systemMsg, ...conv.messages]
    if (process.client) {
      sessionStorage.setItem('chat_conv_id', String(conv.id))
    }
    saveSession()
  }

  function newChat() {
    state.messages.value = [systemMsg, { role: 'assistant', content: 'Hello! Ask me anything.' }]
    if (process.client) {
      sessionStorage.removeItem('chat_conv_id')
    }
    saveSession()
  }

  function clearMessages() {
    state.messages.value = [systemMsg, { role: 'assistant', content: 'Chat cleared. Ask me anything.' }]
    if (process.client) {
      sessionStorage.removeItem('chat_conv_id')
    }
    saveSession()
  }

  function downloadChat() {
    if (!process.client) return
    const msgs = state.messages.value.filter(m => m.role !== 'system')
    const text = msgs.map(m => {
      const label = m.role === 'assistant' ? 'Bot' : 'You'
      return `[${label}] ${m.content}`
    }).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `chat-export-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return {
    messages: readonly(state.messages),
    loading: readonly(state.loading),
    sendMessage,
    restoreSession,
    loadConversation,
    newChat,
    clearMessages,
    downloadChat,
  }
}
