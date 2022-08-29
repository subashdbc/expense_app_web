<script setup lang="ts">
import { useQuasar } from 'quasar';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '../../api/axios_setting';
import { TableHeader } from '../../models/header';
import { useDeleteStore } from '../../store/delete.store';

const $q = useQuasar()
const columns: TableHeader[] = [
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: 'name',
    sortable: true
  },
  { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
  { name: 'gender', label: 'Gender', align: 'left', field: 'gender' },
  { name: 'isactive', label: 'Is active', align: 'left', field: 'isactive' },
  { name: 'edit', label: '', align: 'left', field: 'edit' }
]

const loading = ref(false)

const paginationObj = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0
})

const state = reactive({
  search: '' as string,
  data: []
})

const router = useRouter()
const deleteStore = useDeleteStore()
getAllUsersHandler(paginationObj)


function addNewUser() {
  router.push('/users/actions')
}

async function getAllUsersHandler(props: any) {
  loading.value = true
  const paginated = props.pagination || paginationObj.value
  paginationObj.value.rowsPerPage = paginated.rowsPerPage
  const skip = paginated.rowsPerPage * (paginated.page - 1 || 0)
  const { data } = await useApi.post('users/pagination', { skip, take: paginated.rowsPerPage })
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
      const deleteObj = await useApi.delete(`users/${id}`)
      if (deleteObj) {
        getAllUsersHandler(paginationObj)
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

function getUserPaginatedData(props: any) {
  getAllUsersHandler(props)
}

</script>
<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-6 text-left">
        <!-- <q-btn color="primary" @click="addNewUser" glossy label="New" /> -->
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
      :loading="loading"
      :columns="columns"
      row-key="id"
      separator="cell"
      v-model:pagination="paginationObj"
      @request="getUserPaginatedData"
    >
       <template v-slot:body-cell="props">
        <q-td :props="props">
          <template v-if="props.col.name === 'gender'">
            <template v-if="props.value === 'male'">
              <q-icon size="xs" name="fa-solid fa-person" />
              Male
            </template>
            <template v-else-if="props.value === 'female'">
              <q-icon size="xs" name="fa-solid fa-person-dress" />
              Female
            </template>
            <template v-else>
              Others
            </template>
          </template>
          <template v-else-if="props.col.name === 'isactive'">
            <q-icon size="xs" :name="props.value ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
          </template>
          <template v-else-if="props.col.name === 'edit'">
            <q-btn round color="positive" size="sm" glossy icon="fa-solid fa-pen" :to="`/users/actions/${props.row.id}`"></q-btn>
            <q-btn round color="negative" size="sm" class="q-ml-sm glossy" icon="fa-solid fa-trash-can" @click="showDeleteDialog(props.row.id)"></q-btn>
          </template>
          <template v-else>
            {{ props.value }}
          </template>
        </q-td>
      </template>
    </q-table>
  </div>
</template>