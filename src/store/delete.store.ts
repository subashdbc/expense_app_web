import { defineStore } from "pinia";

export const useDeleteStore = defineStore('delete', {
  state: () => ({
    store: {
      dialog: false,
      onSuccess: () => {},
      onCancel: () => {}
    }
  }),
  actions: {
    showWarning (handler : any) {
      this.store.dialog = true
      this.store.onSuccess = handler.onSuccess
      this.store.onCancel = handler.onCancel
    },
    hideWarning () {
      this.store.dialog = false
      this.store.onSuccess = () => false
      this.store.onCancel = () => false
    }
  }
})