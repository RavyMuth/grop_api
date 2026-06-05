<template>
  <div class="min-h-screen bg-soft-bg dark:bg-[#1A1A2E] text-soft-text dark:text-[#EAEAEA] transition-colors duration-200">
    <div class="max-w-3xl mx-auto h-screen flex flex-col">
      <!-- Header -->
      <header class="flex items-center justify-between px-4 md:px-6 py-4 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-soft-xs bg-gradient-to-br from-soft-primary to-soft-secondary flex items-center justify-center text-white text-sm font-bold shadow-soft">
            G
          </div>
          <h1 class="text-lg font-semibold">Gemini Chat</h1>
        </div>
        <div class="flex items-center gap-1">
          <button @click="showHistory = true" class="soft-btn-ghost !p-2" title="History">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button @click="showSettings = true" class="soft-btn-ghost !p-2" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </header>

      <!-- Messages -->
      <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 md:px-6 py-2 space-y-4 scroll-thin">
        <div v-for="(msg, i) in displayMessages" :key="i"
          class="animate-slide-up"
          :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
          <ChatMessage :message="msg" />
        </div>
        <div v-if="loading" class="flex justify-start animate-fade-in">
          <div class="soft-card px-5 py-3.5 rounded-soft-full">
            <div class="flex gap-1.5">
              <span class="w-2 h-2 rounded-full bg-soft-primary/40 animate-bounce" style="animation-delay:0ms"></span>
              <span class="w-2 h-2 rounded-full bg-soft-secondary/40 animate-bounce" style="animation-delay:150ms"></span>
              <span class="w-2 h-2 rounded-full bg-soft-accent/40 animate-bounce" style="animation-delay:300ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="px-4 md:px-6 pb-4 pt-2 flex-shrink-0">
        <div v-if="files.length" class="flex flex-wrap gap-2 mb-3">
          <div v-for="(f, i) in files" :key="i"
            class="flex items-center gap-2 px-3 py-1.5 bg-soft-bg dark:bg-[#1A1A2E] rounded-soft-full text-xs border border-soft-border dark:border-[#2A2A4A] animate-slide-up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="max-w-[120px] truncate">{{ f.name }}</span>
            <button @click="removeFile(i)" class="hover:text-soft-danger transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="flex items-end gap-2 soft-card px-3 py-2 focus-within:shadow-soft-lg focus-within:border-soft-primary transition-all duration-200">
          <button @click="$refs.fileInput.click()" class="soft-btn-ghost !p-2 shrink-0" title="Attach file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input ref="fileInput" type="file" multiple class="hidden" @change="onFileChange">
          <textarea ref="inputEl" v-model="input" @keydown="onKeydown"
            rows="1" placeholder="Ask anything..."
            class="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed py-2 px-1 max-h-[120px] placeholder:text-soft-text-muted dark:placeholder:text-[#A0A0B8]"></textarea>
          <button @click="send" :disabled="loading || (!input.trim() && !files.length)" class="soft-btn !p-2.5 shrink-0 disabled:opacity-30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal v-if="showSettings" @close="showSettings = false" />

    <!-- History Modal -->
    <HistoryModal v-if="showHistory" @close="showHistory = false" @select="loadConversation" />
  </div>
</template>

<script setup lang="ts">
const messagesEl = ref<HTMLDivElement>()
const inputEl = ref<HTMLTextAreaElement>()
const input = ref('')
const loading = ref(false)
const showSettings = ref(false)
const showHistory = ref(false)
const files = ref<File[]>([])

const { messages, sendMessage, loadConversation, restoreSession } = useChat()

const displayMessages = computed(() =>
  messages.value.filter(m => m.role !== 'system')
)

async function send() {
  const text = input.value.trim()
  if (!text && !files.value.length) return
  await sendMessage(text, files.value)
  input.value = ''
  files.value = []
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
  }
  nextTick(() => {
    messagesEl.value?.scrollTo({ top: messagesEl.value.scrollHeight, behavior: 'smooth' })
  })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function onFileChange(e: Event) {
  const t = e.target as HTMLInputElement
  if (t.files) {
    files.value.push(...Array.from(t.files))
  }
  t.value = ''
}

function removeFile(i: number) {
  files.value.splice(i, 1)
}

onMounted(() => {
  restoreSession()
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
    inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 120) + 'px'
  }
})
</script>
