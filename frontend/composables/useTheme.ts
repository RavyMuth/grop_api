const isDark = ref(false)
const theme = ref<'light' | 'dark'>('light')

function init() {
  if (process.client) {
    const saved = localStorage.getItem('groq_theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
      theme.value = 'dark'
    }
    applyTheme()
  }
}

function applyTheme() {
  if (process.client) {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

if (process.client) {
  init()
}

export const useTheme = () => {
  function toggleTheme() {
    isDark.value = !isDark.value
    theme.value = isDark.value ? 'dark' : 'light'
    if (process.client) {
      localStorage.setItem('groq_theme', theme.value)
    }
    applyTheme()
  }

  return {
    isDark: readonly(isDark),
    theme: readonly(theme),
    toggleTheme,
  }
}
