<script setup lang="ts">
import { ref } from 'vue';
import constants from '../../constant/form_types.json'
const props = defineProps({
  references: { type: Object, required: true },
  model: { type: Object, required: true }
})
const isPwd = ref(false)
const formValidation = ref<any>(null)

defineExpose({
  formValidation,
})
</script>

<template>
  <div class="q-pa-sm">
    <q-form class="q-col-gutter-md" ref="formValidation">
      <div class="row q-col-gutter-sm">
        <div :class="prop.class" class="text-left" v-for="(prop, index) in references.properties">
          <template v-if="prop.type === constants.TEXT">
            <q-input filled :label="prop.label" :rules="prop.rules ? prop.rules() : []" v-model="model[prop.model]" hide-hint hide-bottom-space />
          </template>
          <template v-if="prop.type === constants.NUMBER">
            <q-input filled :label="prop.label" :rules="prop.rules ? prop.rules() : []" v-model="model[prop.model]" type="number" hide-hint hide-bottom-space />
          </template>
          <template v-if="prop.type === constants.TEXTAREA">
            <q-input filled :label="prop.label" :rules="prop.rules ? prop.rules() : []" v-model="model[prop.model]" type="textarea" hide-hint hide-bottom-space />
          </template>
          <template v-if="prop.type === constants.PASSWORD">
            <q-input filled :label="prop.label" :rules="prop.rules ? prop.rules() : []" :type="isPwd ? 'password' : 'text'" v-model="model[prop.model]" hide-hint hide-bottom-space >
              <template v-slot:append>
                <q-icon size="xs"
                  :name="isPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </template>
          <template v-if="prop.type === constants.CHECKBOX">
            <q-checkbox filled v-model="model[prop.model]" hide-bottom-space :rules="prop.rules ? prop.rules() : []" :label="prop.label" hide-hint  />
          </template>
          <template v-if="prop.type === constants.SELECT">
            <q-select filled outlined v-model="model[prop.model]" emit-value map-options hide-bottom-space
              :option-value="prop.value" :option-label="prop.select_text" :rules="prop.rules ? prop.rules() : []" :options="prop.options" :label="prop.label"  />
          </template>
          <template v-if="prop.type === constants.DATEPICKER">
            <q-input filled v-model="model[prop.model]" hide-bottom-space :label="prop.label" :rules="prop.rules ? prop.rules() : []">
              <template v-slot:append>
                <q-icon name="fa-solid fa-calendar-day" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="model[prop.model]" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </template>
        </div>
      </div>
      <div class="text-center">
        <q-separator inset class="q-mt-sm q-mb-sm" />
        <template v-for="btn in references.buttons">
          <q-btn v-if="!btn.is_show" class="q-mr-sm glossy" :key="btn.name" type="button" :loading="btn.loading" :label="btn.label" @click="btn.click" :color="btn.color">
            {{ btn.name }}
          </q-btn>
        </template>
      </div>
    </q-form>
  </div>
</template>
<style>
</style>