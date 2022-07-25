<script setup lang="ts">
import { useDeleteStore } from '../../store/delete.store';
const deleteStore: any = useDeleteStore()
// const props = defineProps({
//   onSuccess: { type: Function, required: true },
//   onCancel: { type: Function, required: true }
// })
</script>

<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog persistent v-model="deleteStore.store.dialog">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Delete warning!</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll">
          Are you sure want to remove this record?
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn label="Yes" glossy color="negative" @click="deleteStore.store.onSuccess()" />
          <q-btn label="No" glossy color="positive" @click="deleteStore.store.onCancel()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
