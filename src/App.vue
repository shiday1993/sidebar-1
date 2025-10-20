<template>
  <Default v-if="token" />
  <Auth v-else />
</template>

<script setup>
import { ref } from 'vue'
import Default from '@/layouts/DefaultLayout.vue'
import Auth from '@/layouts/AuthLayout.vue'

const token = ref(localStorage.getItem('token'))
</script>
