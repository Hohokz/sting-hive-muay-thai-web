import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import th from './locales/th.json'
import zh from './locales/zh.json'

const savedLocale = localStorage.getItem('user-locale') || 'en'

const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    th,
    zh,
  },
})

export default i18n
