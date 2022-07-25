import axios from "axios";
import { defineStore } from "pinia";
import { useCookies } from "vue3-cookies";
import { useApi } from "../api/axios_setting";
import { Login } from "../models/login";
import router from "../router";
const { cookies } = useCookies();


export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    userData: {}
  }),
  actions: {
    async login(model: Login): Promise<boolean> {
      return useApi.post('auth/login', model)
      .then((result) => {
        if (result.data) {
            this.isAuthenticated = true
            this.setAuthData(true, result.data)
            const { access_token } = result.data
            var date = new Date()
            date.setDate(date.getDate() + 4)
            cookies.set('expense_app_user', JSON.stringify(result.data), date, undefined, undefined, true, 'Strict')
            cookies.set('expense_app_token', access_token, date, undefined, undefined, true, 'Strict')
            return true
          } else {
            return false
          }
        })
    },
    setAuthData (isLoggedIn: boolean, data: any) {
      this.isAuthenticated = isLoggedIn
      this.userData = data
    },
    logout () {
      this.isAuthenticated = false
      this.userData = {}
      cookies.remove('expense_app_user')
      cookies.remove('expense_app_token')
      router.push('/login')
    }
  }
})