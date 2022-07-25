<script setup lang="ts">
import constants from '../../constant/form_types.json'
import { reactive, computed, ref, getCurrentInstance } from 'vue';
import { useApi } from '../../api/axios_setting';
import { TableHeader } from '../../models/header';
import FormTemplateVue from '../../components/shared/FormTemplate.vue';
import { useQuasar } from 'quasar';
import { useDeleteStore } from '../../store/delete.store';
import dayjs from 'dayjs';

const columns: TableHeader[] = [
  {
    name: 'amount',
    label: 'Amount',
    align: 'left',
    field: 'amount',
    sortable: true
  },
  { name: 'receivedOn', label: 'Received On', align: 'left', field: 'receivedOn' },
  { name: 'user', label: 'User', align: 'left', field: 'user' },
  { name: 'edit', label: '', align: 'left', field: 'edit' }
]
const validateForm = ref<any>(null)
const paginationObj = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0
})

const loading = ref(false)
const listLoading = ref(false)
const $q = useQuasar()
const deleteStore = useDeleteStore()
const internalInstance = getCurrentInstance()

const validate: any = internalInstance?.appContext.config.globalProperties
const state = reactive({
  search: '' as string,
  data: [],
  model: {
    isactive: true
  } as any,
  saveUpdateForm: {
    dialog: false,
    onSuccess: () => false,
    onCancel: () => false
  }
})

const formProps = computed<any>(() => {
  return {
    title:  state.model.id ? 'Update income' : 'Add income',
    properties: [{
      model: 'amount',
      type: constants.NUMBER,
      rules: validate.$validate._required,
      label: 'Amount',
      class: 'col-12'
    }, {
      model: 'receivedOn',
      type: constants.DATEPICKER,
      label: 'Received on',
      class: 'col-12'
    }],
    buttons: [{
      label: state.model.id ? 'Update' : 'Save',
      loading: loading.value,
      click: () => saveFormHandler(),
      color: 'primary'
    }, {
      label: 'Close',
      click: () => closeForm(),
      color: 'negative'
    }]
  }
})

getAllIncomeHandler(paginationObj)

function addNewIncome() {
  state.saveUpdateForm.dialog = true
  state.model = { receivedon: '' }
}

async function getAllIncomeHandler(props: any) {
  loading.value = true
  const paginated = props.pagination || paginationObj.value
  paginationObj.value.rowsPerPage = paginated.rowsPerPage
  const skip = paginated.rowsPerPage * (paginated.page - 1 || 0)
  const { data } = await useApi.post('income/pagination', { relations: ['user'], skip, take: paginated.rowsPerPage })
  if (data) {
    paginationObj.value.page = paginated.page
    paginationObj.value.rowsNumber = data[1]
    state.data = data[0]
  }
  loading.value = false
}

function showDeleteDialog(id: number) {
  const handler = {
    onSuccess: async () => {
      const deleteObj = await useApi.delete(`income/${id}`)
      if (deleteObj) {
        getAllIncomeHandler(paginationObj)
        $q.notify({
          type: 'positive',
          message: 'Record has been removed successfully!',
          classes: 'glossy'
        })
        deleteStore.hideWarning()
      }
    },
    onCancel: () => {
      deleteStore.hideWarning()
    }
  }
  deleteStore.showWarning(handler)
}


async function saveFormHandler() {
  const isValid = await validateForm.value.formValidation.validate()
  if (isValid) {
    loading.value = true
    if (state.model) {
      state.model.amount = +state.model.amount
      state.model.receivedOn = dayjs(state.model.receivedOn).format('YYYY-MM-DD 23:00:00')
    }
    if (state.model.id) {
      await updateRecord(state.model)
    } else {
      await saveModel(state.model)
    }
    state.saveUpdateForm.dialog = false
    getAllIncomeHandler(paginationObj)
    $q.notify({
        type: 'positive',
        message: state.model.id ? 'Record has been updated successfully!' : 'Record has been saved successfully!',
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
  return useApi.post('/income', model)
}


function updateRecord(model: any){
  return useApi.patch(`/income/${state.model.id}`, model)
}

function editIncome(model: any) {
  const modelData = JSON.parse(JSON.stringify(model))
  modelData.receivedOn = dayjs(modelData.receivedOn).format('YYYY-MM-DD')
  state.model = modelData
  state.saveUpdateForm.dialog = true
}

function closeForm() {
  state.saveUpdateForm.dialog = false
}

function getFormatedDate(date: string) {
  return dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD')
}

function getIncomePaginatedData(props: any) {
  getAllIncomeHandler(props)
}


</script>
<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-6 text-left">
        <q-btn color="primary" @click="addNewIncome" glossy label="New" />
      </div>
      <div class="col-6 text-right">
        <q-input filled v-model="state.search" label="Search" hide-hint>
          <template v-slot:append>
            <q-icon v-if="state.search === ''" name="fa-solid fa-magnifying-glass" />
            <q-icon v-else name="fa-solid fa-xmark" class="cursor-pointer" @click="state.search = ''" />
          </template>
        </q-input>
      </div>
    </div>
    <q-table flat
      :rows="state.data"
      title=" "
      :loading="listLoading"
      :columns="columns"
      row-key="name"
      separator="cell"
      v-model:pagination="paginationObj"
      @request="getIncomePaginatedData"
    >
       <template v-slot:body-cell="props">
        <q-td :props="props">
          <template v-if="props.col.name === 'amount'">
            <q-icon name="fa-solid fa-indian-rupee-sign" />
            {{ props.value }}
          </template>
          <template v-else-if="props.col.name === 'receivedOn'">
            {{ getFormatedDate(props.value) }}
          </template>
          <template v-else-if="props.col.name === 'user'">
            {{ props.value.name }}
          </template>
          <template v-else-if="props.col.name === 'edit'">
            <q-btn round color="positive" size="sm" glossy icon="fa-solid fa-pen" @click="editIncome(props.row)"></q-btn>
            <q-btn round color="negative" size="sm" class="q-ml-sm glossy" icon="fa-solid fa-trash-can" @click="showDeleteDialog(props.row.id)"></q-btn>
          </template>
          <template v-else>
            {{ props.value }}
          </template>
        </q-td>
      </template>
    </q-table>
    <!-- Save and update form -->
    <q-dialog v-model="state.saveUpdateForm.dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ formProps.title }}</div>
        </q-card-section>
        <q-separator inset class="q-mt-sm q-mb-sm" />
        <q-card-section>
          <FormTemplateVue :references="formProps" ref="validateForm" :model="state.model"></FormTemplateVue>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>