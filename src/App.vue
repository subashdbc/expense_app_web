<script setup lang="ts">
import { useCookies } from 'vue3-cookies';
import Layout from './components/shared/Layout.vue';
import ReloadPWA from "./components/ReloadPWA.vue";
import { useAuthStore } from './store/auth.store';
const { cookies } = useCookies();
const authStore = useAuthStore()

let authToken = cookies.get('expense_app_token')
let user = cookies.get('expense_app_user') ? cookies.get('expense_app_user') : {}

let authDetails = { access_token: authToken, ...user }

if (authToken) {
  authStore.setAuthData(true, authDetails)
}
</script>

<template>
  <ReloadPWA />
  <Layout msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
thead {
  background: #20856c08;
  box-shadow: 1px 0px 8px 0px grey;
}
.q-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
