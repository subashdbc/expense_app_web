export default {
  install (app: any, options: any): void {
    app.config.globalProperties.$validate = {
      _required () {
        return [(val: any) => !!val || 'Required', (val: any) => !/^\s*$/.test(val) || 'Required']
      }
    }
  }
}