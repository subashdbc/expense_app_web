<script setup lang="ts">
import { useQuasar } from 'quasar';
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '../../api/axios_setting';
import { Gender } from '../../enums/gender';
import { RegiserUser } from '../../models/login';
import { useAuthStore } from '../../store/auth.store';
const auth = reactive<RegiserUser>({
  email: '' as string,
  password: '' as string,
  confirmPassword: '' as string,
  gender: '' as string
})
const validateForm = ref<any>(null)
const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const isPwd = ref(false)
const loading = ref(false)

const genderList = computed<any>(() => {
  return [{
    label: 'Male',
    value: Gender.MALE
  }, {
    label: 'Female',
    value: Gender.FEMALE
  }, {
    label: 'Others',
    value: Gender.OTHERS
  }]
})

function addNewUser() {
  loading.value = true
  validateForm.value.validate().
    then(async (validated: boolean) => {
      if (validated) {
        const data = await useApi.post('/users', auth)
        if (data) {
          $q.notify({
          type: 'postive',
          message: 'User has been created successfully!',
          classes: 'glossy'
        })
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
  <div class="row" style="height: 90vh">
    <div class="col-0 col-md-6 flex justify-center content-center">
      <img src="../../assets/login.svg" class="responsive" alt="login-image">
    </div>
    <div v-bind:class="{'justify-center': $q.screen.md || $q.screen.sm ||$q.screen.xs}"
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
                :type="isPwd ? 'password' : 'text'"
                :rules="$validate._required()" type="password" label="Password">
                  <template v-slot:append>
                    <q-icon size="xs"
                      :name="isPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
              </q-input>
              <q-input square filled v-model="auth.confirmPassword"
                :type="isPwd ? 'password' : 'text'"
                :rules="$validate._required()" type="password" label="Password">
                  <template v-slot:append>
                    <q-icon size="xs"
                      :name="isPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
              </q-input>
              <q-select filled outlined v-model="auth.gender" emit-value map-options hide-bottom-space
                option-value="value" option-label="label" :rules="$validate._required()"
                :options="genderList" label="Gender"  />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn unelevated color="primary" :loading="loading" glossy size="lg" @click="addNewUser" class="full-width" label="Login" />
          </q-card-actions>
          <q-card-section class="text-center q-pa-none">
            <p class="text-grey-6"></p>
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