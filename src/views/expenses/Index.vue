<script setup lang="ts">
import constants from '../../constant/form_types.json'
import { useQuasar } from 'quasar'
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import FormTemplateVue from '../../components/shared/FormTemplate.vue';
import { useApi } from '../../api/axios_setting';
import dayjs from 'dayjs';
import { useDeleteStore } from '../../store/delete.store';
import format from 'dayjs/plugin/customParseFormat'
dayjs.extend(format)

const $q = useQuasar()
const deleteStore = useDeleteStore()
const loading = ref(false)
const listLoading = ref(false)
const internalInstance = getCurrentInstance()
const validate: any = internalInstance?.appContext.config.globalProperties
const availbleThemeColors = internalInstance?.appContext.config.globalProperties.$q.config.brand
const validateForm = ref<any>(null)
const module = reactive<any>({
  dialog: false,
  model: {},
  categories: [],
  allExpenses: [],
  monthFilter: dayjs().format('MMM / YYYY')
})

getAllCategories()
getAllExpenses()

const totalAmount = computed<number>(() => {
  const total = module.allExpenses.map((x: any) => x.amount)
  return [...total].reduce((acc, val) => acc + val, 0)
})

const formProps = computed<any>(() => {
  return {
    title:  module.model.id ? 'Update expense' : 'Add expense',
    properties: [{
      model: 'name',
      type: constants.TEXT,
      rules: validate.$validate._required,
      label: 'Name',
      class: 'col-12'
    }, {
      model: 'amount',
      type: constants.NUMBER,
      rules: validate.$validate._required,
      label: 'Amount',
      class: 'col-12'
    }, {
      model: 'date',
      type: constants.DATEPICKER,
      label: 'Date',
      ref: 'datePicker',
      class: 'col-12'
    }, {
      model: 'categoryId',
      type: constants.SELECT,
      options: module.categories,
      value: 'id',
      select_text: 'name',
      label: 'Category',
      class: 'col-12'
    }, {
      model: 'notes',
      type: constants.TEXTAREA,
      label: 'Notes',
      class: 'col-12'
    }],
    buttons: [{
      label: module.model.id ? 'Update' : 'Save',
      loading: loading.value,
      click: () => saveFormHandler(),
      color: 'primary'
    }, {
      label: 'Delete',
      click: () => showDeleteDialog(),
      is_show: !module.model.id,
      color: 'negative'
    }, {
      label: 'Close',
      click: () => closeFormDialog(),
      color: 'secondary'
    }]
  }
})

async function getAllExpenses() {
  listLoading.value = true
  const date = dayjs(module.monthFilter, 'MMM / YYYY').format('YYYY-MM-DD 00:00:00')
  const results = await useApi.post(`/expenses/detailed_view/`, {date})
  const values = results.data
  const colors = Object.keys(availbleThemeColors);
  let index = 0;
  values.map((x: any) => {
    x.color = colors[index]
    index++;
    if ((index % 7) === 0) index = 0
    return x
  })
  module.allExpenses = values;
  listLoading.value = false;
}

async function getAllCategories() {
  const { data } = await useApi.get('/expenses_category')
  module.categories = data
}

function openExpenseDialog() {
  module.dialog = true
  module.model = {}
}

async function saveFormHandler() {
  const isValid = await validateForm.value.formValidation.validate()
  if (isValid) {
    loading.value = true
    if (module.model) {
      module.model.amount = +module.model.amount
      module.model.date = dayjs(module.model.date, 'YYYY-MM-DD').format('YYYY-MM-DD 23:00:00')
    }
    if (module.model.id) {
      await updateRecord(module.model)
    } else {
      await saveModel(module.model)
    }
    module.dialog = false
    getAllExpenses()
    $q.notify({
        type: 'positive',
        message: 'Record has been saved successfully!',
        classes: 'glossy'
      })
    loading.value = false
  } else {
    loading.value = false
    $q.notify({
        type: 'negative',
        message: 'Please check the required fields!',
        classes: 'glossy'
      })
  }
}

function saveModel(model: any) {
  return useApi.post('/expenses', model)
}

function updateRecord(model: any){
  return useApi.patch(`/expenses/${module.model.id}`, model)
}

function editExpense(model: any) {
  const saveObj = JSON.parse(JSON.stringify(model))
  saveObj.date = dayjs(saveObj.date).format('YYYY-MM-DD')
  module.model = saveObj
  module.dialog = true
}

function showDeleteDialog() {
  const id: number = module.model.id
  const handler = {
    onSuccess: async () => {
      const deleteObj = await useApi.delete(`expenses/${id}`)
      if (deleteObj) {
        getAllExpenses()
        $q.notify({
          type: 'positive',
          message: 'Record has been removed successfully!',
          classes: 'glossy'
        })
        deleteStore.hideWarning()
        module.dialog = false
      }
    },
    onCancel: () => {
      deleteStore.hideWarning()
    }
  }
  deleteStore.showWarning(handler)
}

function closeFormDialog() {
  module.dialog = false
  module.model = {}
}

function navigateWeek(type: string) {
  if (type === 'add') {
    module.monthFilter = dayjs(module.monthFilter, 'MMM / YYYY').add(1, 'months').format('MMM / YYYY')
  } else if (type === 'subtract') {
    module.monthFilter = dayjs(module.monthFilter, 'MMM / YYYY').subtract(1, 'months').format('MMM / YYYY')
  }
  getAllExpenses()
}

function getDateFormat(date: string | number, from: string, to: string) {
  return dayjs(date, from).format(to)
}

</script>
<template>
  <div class="q-px-xs q-pb-xs">
    <div class="row q-col-gutter-sm q-mt-sm justify-around">
      <div class="col-lg-4 col-sm-3 col-xs-2 no-padding text-right">
        <q-btn glossy size="md" round icon="fa-solid fa-angle-left fa-shake" @click="navigateWeek('subtract')" color="primary" />
      </div>
      <div class="col-lg-2 col-sm-6 col-xs-8 no-padding text-center">
        <span class="text-h6">{{ module.monthFilter }}</span>
        <div class="text-h6">
          <q-chip color="#af573473" class="total-border">
            <q-avatar icon="fa-solid fa-indian-rupee-sign" color="primary" text-color="white" />
            <b>{{ totalAmount }}</b>
          </q-chip>
        </div>
      </div>
      <div class="col-lg-4 col-sm-3 col-xs-2 no-padding text-left">
        <q-btn glossy size="md" round icon="fa-solid fa-angle-right fa-shake" @click="navigateWeek('add')" color="primary" />
      </div>
    </div>
    <q-list bordered :style="{ 'height': `${$q.screen.height - 170}px`, borderRadius: '20px', 'overflow-y': 'auto' }">
      <div class="q-pa-xs">
        <template v-if="listLoading">
          <q-item class="q-pa-xs" v-for="i in 10">
            <q-item-section avatar>
              <q-skeleton type="QAvatar" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" width="65%" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <q-intersection v-else v-for="expense in module.allExpenses" :key="expense.id" transition="scale" once>
          <q-item class="q-pa-xs">
            <q-item-section :class="`${$q.screen.lt.sm ? 'q-pr-xs' : 'q-pr-md'}`" avatar>
              <q-avatar size="60px" class="glossy shadow-5 fancy-border" font-size="18px" :color="expense.color" text-color="white">
                {{ getDateFormat(expense.date, 'YYYY-MM-DD', 'ddd') }}
                <q-badge :color="expense.color" style="font-size: 15px;min-height: 25px;" font rounded transparent floating>
                  <b>{{ getDateFormat(expense.date, 'YYYY-MM-DD', 'DD') }}</b>
                </q-badge>
              </q-avatar>
            </q-item-section>
            <q-item-section class="text-left fancy-highligher fancy-item-border">
              <div class="row q-pa-sm">
                <div class="col-xs-12 col-sm-7 col-md-8" @click="editExpense(expense)">
                  <b>{{ expense.name }}</b>
                </div>
                <div class="col-xs-12 col-sm-5 col-md-4 text-right">
                  <q-badge :color="expense.color" style="font-size: 10px;min-height: 20px;" font rounded transparent>
                    <q-icon name="fa-solid fa-indian-rupee-sign"></q-icon>
                  </q-badge>
                  <b class="q-ml-xs">{{ expense.amount }}</b>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-intersection>
      </div>
    </q-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn glossy fab :icon="`fa-solid fa-plus ${module.dialog ? '' : 'fa-bounce'}`" @click="openExpenseDialog" color="primary" />
    </q-page-sticky>
    <!-- Save and update form -->
    <q-dialog v-model="module.dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ formProps.title }}</div>
        </q-card-section>
        <q-separator inset class="q-mt-sm q-mb-sm" />
        <q-card-section class="scroll">
          <FormTemplateVue :references="formProps" ref="validateForm" :model="module.model"></FormTemplateVue>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<style>
.fancy-border {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}
.fancy-item-border {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 20px;
}
.fancy-highligher {
  border: 2px solid #ece9e9;
  background: #ffffff00;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 50%, rgb(0 0 0 / 4%) 51%, rgba(0, 0, 0, 0.04)) !important;
}
.total-border {
  border-top-left-radius: 35px;
  border-bottom-left-radius: 35px;
  background: #ac563345 !important;
}
</style>