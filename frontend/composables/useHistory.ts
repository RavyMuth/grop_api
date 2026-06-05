const conversations = ref<any[]>([])
const showHistory = ref(false)

function loadList() {
  if (process.client) {
    try {
      const data = localStorage.getItem('groq_conversations')
      conversations.value = data ? JSON.parse(data) : []
    } catch {
      conversations.value = []
    }
  }
}

function titleFromMsgs(msgs: { role: string; content: string }[]) {
  const first = msgs.find(m => m.role === 'user')
  return first ? first.content.slice(0, 60).replace(/\n.*/, '') : 'New chat'
}

function dateGroupLabel(date: number) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()) return 'Yesterday'
  if (diff < 604800000) return 'This week'
  if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return 'This month'
  return 'Older'
}

loadList()

export const useHistory = () => {
  function saveConversation(messages?: { role: string; content: string }[]) {
    if (!process.client) return
    const msgs = (messages ?? useChat().messages.value).filter(m => m.role !== 'system')
    if (!msgs.length) return
    const key = 'groq_conversations'
    let list = JSON.parse(localStorage.getItem(key) || '[]')
    const title = titleFromMsgs(msgs)
    const cid = sessionStorage.getItem('chat_conv_id')
    const existing = cid ? list.findIndex((c: any) => c.id === Number(cid)) : -1
    if (existing !== -1) list.splice(existing, 1)
    const entry = {
      id: cid ? Number(cid) : Date.now(),
      title,
      count: msgs.length,
      messages: JSON.parse(JSON.stringify(msgs)),
    }
    list.unshift(entry)
    sessionStorage.setItem('chat_conv_id', String(entry.id))
    if (list.length > 50) list = list.slice(0, 50)
    localStorage.setItem(key, JSON.stringify(list))
    conversations.value = list
  }

  const grouped = computed(() => {
    const groups: Record<string, any[]> = {}
    const activeId = process.client ? sessionStorage.getItem('chat_conv_id') : null
    conversations.value.forEach((c: any) => {
      c.active = String(c.id) === activeId
      const label = dateGroupLabel(c.id)
      if (!groups[label]) groups[label] = []
      groups[label].push(c)
    })
    const order = ['Today', 'Yesterday', 'This week', 'This month', 'Older']
    return order.filter(g => groups[g]).map(g => ({ label: g, items: groups[g] }))
  })

  function deleteConversation(id: number) {
    if (!process.client) return
    let list = JSON.parse(localStorage.getItem('groq_conversations') || '[]')
    list = list.filter((c: any) => c.id !== id)
    localStorage.setItem('groq_conversations', JSON.stringify(list))
    if (sessionStorage.getItem('chat_conv_id') === String(id)) {
      sessionStorage.removeItem('chat_conv_id')
    }
    conversations.value = list
  }

  function loadById(id: number) {
    if (!process.client) return
    const list = JSON.parse(localStorage.getItem('groq_conversations') || '[]')
    const conv = list.find((c: any) => c.id === id)
    if (conv) {
      useChat().loadConversation(conv)
    }
  }

  function openHistory() {
    loadList()
    showHistory.value = true
  }

  return {
    conversations: readonly(conversations),
    grouped,
    showHistory: readonly(showHistory),
    saveConversation,
    deleteConversation,
    loadById,
    openHistory,
    loadList,
  }
}
