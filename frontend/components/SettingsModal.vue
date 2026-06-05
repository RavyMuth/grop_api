<template>
  <Teleport to="body">
    <div class="soft-modal" @click.self="$emit('close')">
      <div class="soft-modal-content">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold">Settings</h2>
          <button @click="$emit('close')" class="soft-btn-ghost !p-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Theme -->
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-soft-text-muted dark:text-[#A0A0B8]">Theme</label>
            <div class="flex items-center gap-3 mt-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <span class="text-sm flex-1">Dark mode</span>
              <button @click="toggleTheme"
                :class="isDark ? 'bg-soft-primary' : 'bg-soft-border dark:bg-[#2A2A4A]'"
                class="relative w-11 h-6 rounded-soft-full transition-colors duration-200">
                <span :class="isDark ? 'translate-x-[22px]' : 'translate-x-[2px]'"
                  class="absolute top-[2px] left-0 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"></span>
              </button>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
          </div>

          <!-- History -->
          <div>
            <button @click="handleHistory" class="soft-btn w-full">Conversation history</button>
          </div>

          <!-- New Chat -->
          <div>
            <button @click="handleNewChat" class="soft-btn w-full">New chat</button>
          </div>

          <!-- Download -->
          <div>
            <button @click="handleDownload" class="soft-btn w-full">Download chat</button>
          </div>

          <!-- Clear -->
          <div>
            <button @click="handleClear" class="soft-btn-danger w-full">Clear all messages</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
const { toggleTheme, isDark } = useTheme()
const { clearMessages, downloadChat } = useChat()
const { openHistory } = useHistory()

function handleHistory() {
  emit('close')
  openHistory()
}

function handleNewChat() {
  emit('close')
  useChat().newChat()
}

function handleDownload() {
  emit('close')
  downloadChat()
}

function handleClear() {
  emit('close')
  if (confirm('Clear all messages?')) clearMessages()
}
</script>
