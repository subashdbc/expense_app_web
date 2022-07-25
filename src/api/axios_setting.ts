import axios, { AxiosInstance } from 'axios'
import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies();
const api = axios

const useApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: {
    'Authorization': `Bearer ${cookies.get('expense_app_token')}`,
  }
})

export { api, useApi }
