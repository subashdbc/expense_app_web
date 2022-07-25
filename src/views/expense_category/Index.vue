<script setup lang="ts">
import constants from '../../constant/form_types.json'
import { reactive, computed, ref, getCurrentInstance } from 'vue';
import { useApi } from '../../api/axios_setting';
import { TableHeader } from '../../models/header';
import { useQuasar } from 'quasar';
import { useDeleteStore } from '../../store/delete.store';
import FormTemplateVue from '../../components/shared/FormTemplate.vue';

const columns: TableHeader[] = [
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: 'name',
    sortable: true
  },
  { name: 'isactive', label: 'Is active', align: 'left', field: 'isactive' },
  { name: 'edit', label: '', align: 'left', field: 'edit' }
]
const loading = ref(false)
const listLoading = ref(false)
const validateForm = ref<any>(null)
const paginationObj = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0
})

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
    title:  state.model.id ? 'Update expense category' : 'Add expense category',
    properties: [{
      model: 'name',
      type: constants.TEXT,
      rules: validate.$validate._required,
      label: 'Name',
      class: 'col-12'
    }, {
      model: 'isactive',
      type: constants.CHECKBOX,
      label: 'Is active?',
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


getAllExpenseCategoryHandler(paginationObj)


function addNewCategory() {
  state.saveUpdateForm.dialog = true
  state.model = { isactive: false }
}

async function getAllExpenseCategoryHandler(props: any) {
  listLoading.value = true
  const paginated = props.pagination || paginationObj.value
  paginationObj.value.rowsPerPage = paginated.rowsPerPage
  const skip = paginated.rowsPerPage * (paginated.page - 1 || 0)
  const { data } = await useApi.post('expenses_category/pagination', { skip, take: paginated.rowsPerPage })
  if (data) {
    paginationObj.value.page = paginated.page
    paginationObj.value.rowsNumber = data[1]
    state.data = data[0]
  }
  listLoading.value = false
}

function showDeleteDialog(id: number) {
  const handler = {
    onSuccess: async () => {
      const deleteObj = await useApi.delete(`expenses_category/${id}`)
      if (deleteObj) {
        getAllExpenseCategoryHandler(paginationObj)
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
    if (state.model.id) {
      await updateRecord(state.model)
    } else {
      await saveModel(state.model)
    }
    state.saveUpdateForm.dialog = false
    getAllExpenseCategoryHandler(paginationObj)
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
  return useApi.post('/expenses_category', model)
}


function updateRecord(model: any){
  return useApi.patch(`/expenses_category/${state.model.id}`, model)
}

function editExpenseCategory(model: any) {
  state.model = JSON.parse(JSON.stringify(model))
  state.saveUpdateForm.dialog = true
}

function closeForm() {
  state.saveUpdateForm.dialog = false
}

function getExpenseCategoryPaginatedData(props: any) {
  getAllExpenseCategoryHandler(props)
}

</script>
<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-6 text-left">
        <q-btn color="primary" @click="addNewCategory" glossy label="New" />
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
      @request="getExpenseCategoryPaginatedData"
    >
       <template v-slot:body-cell="props">
        <q-td :props="props">
          <template v-if="props.col.name === 'isactive'">
            <q-icon size="xs" :name="props.value ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
          </template>
          <template v-else-if="props.col.name === 'edit'">
            <q-btn round color="positive" size="sm" glossy icon="fa-solid fa-pen" @click="editExpenseCategory(props.row)"></q-btn>
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