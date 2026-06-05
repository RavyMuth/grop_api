<template>
  <div :class="msg.role === 'user'
    ? 'bg-gradient-to-r from-soft-primary/10 to-soft-secondary/10 dark:from-soft-primary/15 dark:to-soft-secondary/15 rounded-soft-sm px-4 py-2.5 max-w-[85%]'
    : 'max-w-full group'">
    <div v-if="msg.role === 'user'" class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</div>
    <div v-else class="text-sm leading-relaxed">
      <div class="prose prose-sm dark:prose-invert max-w-none" v-html="rendered"></div>
      <button @click="copyMessage"
        class="mt-2 soft-btn-ghost !p-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        :class="{ '!opacity-100': copied }">
        <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{ message: { role: string; content: string } }>()
const msg = toRef(props, 'message')
const copied = ref(false)

const rendered = computed(() => {
  if (msg.value.role === 'assistant') {
    return marked.parse(msg.value.content, { breaks: true }) as string
  }
  return ''
})

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(msg.value.content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {}
}
</script>

<style scoped>
.prose :deep(pre) {
  @apply p-4 rounded-soft-xs overflow-x-auto text-sm leading-relaxed my-2;
}
.prose :deep(code) {
  @apply font-mono text-sm;
}
.prose :deep(p) {
  @apply my-1;
}
.prose :deep(p:first-child) {
  @apply mt-0;
}
.prose :deep(p:last-child) {
  @apply mb-0;
}
</style>
