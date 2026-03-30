import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import th from './locales/th.json'
import zh from './locales/zh.json'

const urlParams = new URLSearchParams(window.location.search)
const urlLang = urlParams.get('lang')
const savedLocale = urlLang || localStorage.getItem('user-locale') || 'en'

if (urlLang) {
  localStorage.setItem('user-locale', urlLang)
}

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
