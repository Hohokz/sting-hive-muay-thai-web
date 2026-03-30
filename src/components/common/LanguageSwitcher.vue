<template>
  <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-full shadow-inner w-fit">
    <button
      @click="setLanguage('en')"
      class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
      :class="locale === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
    >
      EN
    </button>
    <button
      @click="setLanguage('th')"
      class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
      :class="locale === 'th' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
    >
      TH
    </button>
    <button
      @click="setLanguage('zh')"
      class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
      :class="locale === 'zh' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
    >
      ZH
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const setLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('user-locale', lang)
}
</script>

<style scoped>
/* Optional: Add smooth transition for the "pill" effect if using a more complex slider,
   but this simple toggle is clean and effective. */
</style>
