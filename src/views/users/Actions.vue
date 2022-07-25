<script setup lang="ts">
import constants from '../../constant/form_types.json'
import { getCurrentInstance, computed, reactive, ref, onMounted } from 'vue';
import FormTemplateVue from '../../components/shared/FormTemplate.vue';
import { useQuasar } from 'quasar';
import { useApi } from '../../api/axios_setting';
import { useRoute, useRouter } from 'vue-router';
import { Gender } from '../../enums/gender';

const internalInstance = getCurrentInstance()
const validate: any = internalInstance?.appContext.config.globalProperties
const $q = useQuasar()
const loading = ref(false)
const validateForm = ref<any>(null)
const router = useRouter()
const route = useRoute()

const userId: number | string | string[] = route.params.user_id
const user = reactive({
  model: {
    isactive: false
  } as any,
  genders: [{
    label: 'Male',
    value: Gender.MALE
  }, {
    label: 'Female',
    value: Gender.FEMALE
  }, {
    label: 'Others',
    value: Gender.OTHERS
  }] as GenderList[]
})

interface GenderList {
  label: string,
  value: string
}


onMounted(() => {
  if (userId) editRecord(+userId)
})

const formProps = computed<any>(() => {
  return {
    title:  userId ? 'Update User' : 'Add User',
    properties: [{
      model: 'name',
      type: constants.TEXT,
      rules: validate.$validate._required,
      label: 'Name',
      class: 'col-6'
    }, {
      model: 'email',
      type: constants.TEXT,
      rules: validate.$validate._required,
      label: 'Email',
      class: 'col-6'
    }, {
      model: 'gender',
      type: constants.SELECT,
      options: user.genders,
      rules: validate.$validate._required,
      value: 'value',
      select_text: 'label',
      label: 'Gender',
      class: 'col-6'
    }, {
      model: 'isactive',
      type: constants.CHECKBOX,
      label: 'Is active?',
      class: 'col-6'
    }],
    buttons: [{
      label: userId ? 'Update' : 'Save',
      loading: loading.value,
      click: () => saveFormHandler(),
      color: 'primary'
    }, {
      label: 'Back to list',
      click: () => router.push('/users'),
      color: 'negative'
    }]
  }
})

async function saveFormHandler() {
  const isValid = await validateForm.value.formValidation.validate()
  if (isValid) {
    loading.value = true
    if (userId) {
      await updateRecord(user.model)
    } else {
      await saveModel(user.model)
    }
    loading.value = false
    $q.notify({
        type: 'positive',
        message: userId ? 'Record has been updated successfully!' : 'Record has been saved successfully!',
        classes: 'glossy'
      })
  } else {
    loading.value = false
    $q.notify({
        type: 'positive',
        message: 'Please check the required fields!',
        classes: 'glossy'
      })
  }
}

function saveModel(model: any) {
  return useApi.post('/users', model)
}

async function editRecord(userId: number) {
  const userObj = await useApi.get(`/users/${userId}`)
  if (userObj) {
    user.model = userObj.data
  }
}

function updateRecord(model: any){
  return useApi.patch(`/users/${userId}`, model)
}

</script>
<template>
  <div>
    <FormTemplateVue :references="formProps" ref="validateForm" :model="user.model"></FormTemplateVue>
  </div>
</template>