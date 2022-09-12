import { createApp } from 'vue'
import { Notify, Quasar } from 'quasar'
import router from "./router/index"
import { createPinia } from 'pinia'
import validation from './plugins/validations'
// Import icon libraries
import iconSet from 'quasar/icon-set/fontawesome-v6'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
// Import Quasar css
import 'quasar/src/css/index.sass'
import App from './App.vue'

const myApp = createApp(App)

myApp.use(Quasar, {
  plugins: { Notify },
  config: {
    brand: {
      primary: '#259f80',
      secondary: '#ab6965',
      accent: '#9C27B0',
      dark: '#121212',
      positive: '#21BA45',
      negative: '#D32F2F',
      info: '#31CCEC',
      warning: '#F2C037',
      purple: '#5E35B1',
      brown: '#5D4037',
      blue: '#0288D1',
      pink: '#D81B60',
    }
  },
  iconSet: iconSet
})
myApp.use(createPinia())
myApp.use(validation)
myApp.use(router)
myApp.mount('#app')