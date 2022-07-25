<template>
  <div class="np-padding">
    <q-card flat>
      <router-view :key="$route.fullPath"></router-view>
    </q-card>
  </div>
</template>
