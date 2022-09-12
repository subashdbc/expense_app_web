<script setup lang="ts">
import { useQuasar } from 'quasar';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Login } from '../../models/login';
import { useAuthStore } from '../../store/auth.store';
const auth = reactive<Login>({
  email: '' as string,
  password: '' as string
})
const validateForm = ref<any>(null)
const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const isPwd = ref(false)
const loading = ref(false)

function authenticateHandler() {
  loading.value = true
  validateForm.value.validate().
    then(async (validated: boolean) => {
      if (validated) {
        const result = await authStore.login(auth)
        if (result) {
          router.push('/dashboard').catch((err) => console.log(err))
        }
      }
      else {
        $q.notify({
          type: 'negative',
          message: 'Please check the required fields!',
          classes: 'glossy'
        })
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <img src="../../assets/wave.png" class="wave" alt="login-wave">
  <div class="row" v-bind:style="$q.screen.lt.sm ? {'height': '60vh'} : {'height': '90vh'}">
    <div class="col-0 col-md-6 flex justify-center content-center">
      <img src="../../assets/saving.svg" class="responsive" alt="login-image">
    </div>
    <div v-bind:class="{'justify-center': $q.screen.md || $q.screen.sm || $q.screen.xs}"
         class="col-12 col-md-6 flex content-center">
      <q-card square bordered v-bind:style="$q.screen.lt.sm ? {'width': '80%'} : {'width': '50%'}">
        <q-card-section>
          <q-avatar size="103px" class="absolute-center shadow-10">
            <img src="../../assets/images.png" alt="avatar">
          </q-avatar>
        </q-card-section>
        <q-card-section class="q-mt-xl">
            <q-form class="q-gutter-md" ref="validateForm">
              <q-input square filled v-model="auth.email" :rules="$validate._required()" type="email" label="Email" />
              <q-input square filled v-model="auth.password"
                :type="isPwd ? 'text' : 'password'"
                @keypress.enter="authenticateHandler"
                :rules="$validate._required()" type="password" label="Password">
                  <template v-slot:append>
                    <q-icon size="xs"
                      :name="isPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
              </q-input>
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn unelevated color="primary" :loading="loading" glossy size="lg" @click="authenticateHandler" class="full-width" label="Login">
              <q-icon size="xs" name="fa-solid fa-right-to-bracket" class="cursor-pointer q-ml-sm"/>
            </q-btn>
          </q-card-actions>
          <q-card-section class="text-center q-pa-none">
            <p class="text-grey-6 text-h6" @click="$router.push('/register')" style="cursor: pointer">
              Register
              <q-icon size="sm" name="fa-solid fa-user-plus" class="cursor-pointer q-ml-sm"/>
            </p>
          </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.wave {
  position: fixed;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
}
</style>