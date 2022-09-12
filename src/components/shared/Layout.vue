<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue'
import { useApi } from '../../api/axios_setting';
import { useAuthStore } from '../../store/auth.store';
import { useDeleteStore } from '../../store/delete.store';
import Modal from './DeleteModal.vue';
  const $q = useQuasar()
  const leftDrawerOpen = ref(false)
  const authStore = useAuthStore()
  const deleteStore = useDeleteStore()

  interface Menu {
    name: string;
    icon: string;
    path?: string;
  }

  const isLogged = computed<boolean>(() => {
    return authStore.isAuthenticated
  })

  const userData = computed<any>(() => {
    return authStore.userData
  })

  const deleteWarn = computed<any>(() => {
    return deleteStore
  })


  const menus = computed<Menu[]>(() => {
    const isSuperAdmin = userData.value.id === -100
    const menuList = [{
      name: 'Dashboard',
      icon: 'fa-solid fa-chart-simple',
      path: '/dashboard'
    }, {
      name: 'Users',
      icon: 'fa-solid fa-user-group',
      path: '/users'
    }, {
      name: 'Income',
      icon: 'fa-solid fa-indian-rupee-sign',
      path: '/income'
    }, {
      name: 'Expenses',
      icon: 'fa-solid fa-sack-dollar',
      path: '/expenses'
    }, {
      name: 'Expenses category',
      icon: 'fa-solid fa-check-double',
      path: '/expenses_category'
    }, {
      name: 'Reminders',
      icon: 'fa-solid fa-bell',
      path: '/reminders'
    }]
    if (isSuperAdmin) return menuList
    else return menuList.filter(x => x.path !== '/users')
  })

  function toggleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  function logoutHandler() {
    authStore.logout()
  }

  useApi.interceptors.request.use(function (config: any) {
      // Do something before request is sent
      let authKey = userData.value.access_token
      config.headers["Authorization"] = "Bearer " + authKey;
      return config;
  });

  // config axois issues
  useApi.interceptors.response.use(
    (response) => {
      return Promise.resolve(response)
    },
    (error) => {
      if (error.response) {
        let exception = error.response
        if (error.response.status === 409) {
          setTimeout(() => {
            window.location.reload()
          })
        } else {
          if (error.response.data) exception = `Status Code : ${error.response.status}, Message : ${JSON.stringify(error.response.data)}`
          else exception = `Status Code : ${error.response.status}, Message : ${error.response.statusText}`
          $q.notify({ type: 'negative', message: exception, classes: 'glossy' })
          if (error.response.status === 401) {
            authStore.logout()
          }
        }
      }
      return Promise.reject(error)
    }
  )
</script>
<template>
  <q-layout view="lHh Lpr lFr" class="main-toolbar">
    <template v-if="isLogged">
      <q-header class="bg-primary-tool text-black">
        <q-toolbar elevated :style="`${$q.screen.lt.sm || !leftDrawerOpen ? 'width: 100% !important;' : 'margin-left: 15px !important;width: 98.4% !important;'}`">
          <q-btn dense flat round icon="fa-solid fa-bars" @click="toggleLeftDrawer" />
          <q-toolbar-title>
            Expenses
          </q-toolbar-title>
          <q-btn dense flat round icon="fa-solid fa-bell" class="q-mr-md" />
          <q-btn dense flat round icon="fa-solid fa-user">
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list style="min-width: 100px">
                <q-item clickable>
                <q-item-section side>
                  <q-icon name="fa-solid fa-user-pen" />
                </q-item-section>
                <q-item-section>Profile</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="logoutHandler">
                  <q-item-section side>
                    <q-icon name="fa-solid fa-right-from-bracket" />
                  </q-item-section>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
        <q-list padding>
          <div class="row">
            <div class="col-4">
              <q-avatar square class="avator-name shadow-2" text-color="black">{{ userData && userData.name ? userData.name.charAt(0) : '' }}</q-avatar>
            </div>
            <div class="col-8 text-left q-mt-md text-subtitle1">
              <q-item-section>
                <b>{{ userData.name }}</b>
              </q-item-section>
            </div>
          </div>
          <q-separator inset class="q-mt-sm q-mb-sm" />
          <q-item clickable v-ripple v-for="menu in menus" :key="menu.name" rel="noopener" :to="menu.path" class="q-mt-sm">
            <q-avatar square size="40px" font-size="22px" class="avator-name shadow-2" text-color="black">
              <q-icon size="xs" :name="menu.icon" />
            </q-avatar>
            <q-item-section class="text-left q-ml-md">
              {{ menu.name }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>
    </template>

    <q-page-container class="container" :class="$q.screen.lt.sm || !leftDrawerOpen ? '' : 'q-pa-sm'">
      <router-view class="margin-class" :class="$q.screen.lt.sm || !leftDrawerOpen ? '' : 'q-ml-md q-mr-xs'"
       :style="{ height: `${$q.screen.height - 83}px`, background: 'white', borderRadius: '20px', 'overflow-y': 'auto'}" />
      <modal></modal>
    </q-page-container>
  </q-layout>
</template>
<style>
.main-toolbar
.q-toolbar {
  min-height: 62px !important;
  padding: 0 10px !important;
  background: #ffffff !important;
  border-radius: 13px;
  box-shadow: 0px 4px 1px 0px #d1d1cbb0;
}
.q-header {
  margin-left: 2px;
}
.q-drawer {
  margin-left: 3px !important;
  margin-top: 3px !important;
  border-radius: 13px;
  background: #ffffff !important;
}
.bg-primary-tool {
  background: #e5e5e5 !important;
}
.avator-name {
  background-image: linear-gradient(to bottom,rgba(255,255,255,.3),rgba(255,255,255,0) 50%,rgba(0,0,0,.12) 51%,rgba(0,0,0,.04))!important;
  border-radius: 6px;
}
.container {
  margin-left: 1px !important;
  padding-top: 20px !important;
}
.q-item.q-router-link--active, .q-item--active {
  color: black;
  background: #259f8099;
  border-radius: 9px;
}
.margin-class {
  margin-top: 55px;
}
.q-layout {
  overflow-y: auto;
}
</style>