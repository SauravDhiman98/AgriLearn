import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          nav: {
            home: 'Home',
            courses: 'Courses',
            liveClasses: 'Video Lecture',
            forum: 'Community',
            marketplace: 'Marketplace',
            dashboard: 'Dashboard',
            login: 'Login',
            register: 'Get Started',
            profile: 'Profile',
            logout: 'Logout',
          },
          hero: {
            title: 'Learn Agriculture, Grow Better',
            subtitle: 'Expert-led courses, live classes, and a community of 1 lakh+ farmers',
            cta: 'Start Learning Free',
          },
          courses: {
            title: 'Courses',
            enroll: 'Enroll Now',
            free: 'Free',
            enrolled: 'Enrolled',
            startLearning: 'Continue Learning',
          },
          forum: {
            title: 'Community Forum',
            askQuestion: 'Ask a Question',
            answer: 'Answer',
          },
          marketplace: {
            title: 'Marketplace',
            addToCart: 'Add to Cart',
            buyNow: 'Buy Now',
          },
        },
      },
      hi: {
        translation: {
          nav: {
            home: 'होम',
            courses: 'कोर्स',
            liveClasses: 'वीडियो लेक्चर',
            forum: 'समुदाय',
            marketplace: 'मार्केटप्लेस',
            dashboard: 'डैशबोर्ड',
            login: 'लॉग इन',
            register: 'शुरू करें',
            profile: 'प्रोफाइल',
            logout: 'लॉग आउट',
          },
          hero: {
            title: 'कृषि सीखें, बेहतर उगाएं',
            subtitle: 'विशेषज्ञ नेतृत्व वाले कोर्स, लाइव क्लास और 1 लाख+ किसानों का समुदाय',
            cta: 'मुफ्त में शुरू करें',
          },
          courses: {
            title: 'कोर्स',
            enroll: 'अभी नामांकन करें',
            free: 'मुफ्त',
            enrolled: 'नामांकित',
            startLearning: 'सीखना जारी रखें',
          },
          forum: {
            title: 'सामुदायिक फोरम',
            askQuestion: 'प्रश्न पूछें',
            answer: 'उत्तर दें',
          },
          marketplace: {
            title: 'मार्केटप्लेस',
            addToCart: 'कार्ट में जोड़ें',
            buyNow: 'अभी खरीदें',
          },
        },
      },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
