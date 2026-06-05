<template>
  <Teleport to="body">
    <div class="soft-modal" @click.self="$emit('close')">
      <div class="soft-modal-content max-w-lg max-h-[70vh] flex flex-col">
        <div class="flex items-center justify-between mb-4 shrink-0">
          <h2 class="text-lg font-semibold">Conversation history</h2>
          <button @click="$emit('close')" class="soft-btn-ghost !p-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div v-if="!conversations.length" class="flex-1 flex items-center justify-center text-sm text-soft-text-muted dark:text-[#A0A0B8] py-12">
          No saved conversations.
        </div>

        <div v-else class="flex-1 overflow-y-auto scroll-thin -mx-2 px-2 space-y-0.5">
          <template v-for="(group, gi) in grouped" :key="gi">
            <div class="text-xs font-semibold uppercase tracking-wider text-soft-text-muted dark:text-[#A0A0B8] px-2 pt-4 pb-1">{{ group.label }}</div>
            <div v-for="conv in group.items" :key="conv.id"
              @click="select(conv)"
              :class="conv.active ? 'bg-soft-primary/10 dark:bg-soft-primary/20 border-soft-primary/30' : 'hover:bg-soft-bg dark:hover:bg-[#1A1A2E]'"
              class="flex items-center gap-3 px-3 py-2.5 rounded-soft-xs cursor-pointer transition-all duration-150 border border-transparent group">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate" :class="conv.active ? 'text-soft-primary' : ''">{{ conv.title }}</div>
                <div class="text-xs text-soft-text-muted dark:text-[#A0A0B8] mt-0.5">{{ conv.count }} message{{ conv.count !== 1 ? 's' : '' }}</div>
              </div>
              <button @click.stop="remove(conv.id)" class="soft-btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: []; select: [conv: any] }>()
const { conversations, grouped, deleteConversation, loadById } = useHistory()

function select(conv: any) {
  emit('close')
  loadById(conv.id)
}

function remove(id: number) {
  if (confirm('Delete this conversation?')) deleteConversation(id)
}
</script>
