import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',   // required for Hermes (no Intl.PluralRules)
  resources: {
    en: { translation: {
      home: 'Home', courses: 'Courses', forum: 'Community', marketplace: 'Marketplace', profile: 'Profile',
      login: 'Login', register: 'Get Started', logout: 'Logout',
      enroll: 'Enroll Now', free: 'Free', addToCart: 'Add to Cart',
    }},
    hi: { translation: {
      home: 'होम', courses: 'कोर्स', forum: 'समुदाय', marketplace: 'मार्केटप्लेस', profile: 'प्रोफाइल',
      login: 'लॉग इन', register: 'शुरू करें', logout: 'लॉग आउट',
      enroll: 'अभी नामांकन करें', free: 'मुफ्त', addToCart: 'कार्ट में जोड़ें',
    }},
  },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
