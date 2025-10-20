<template>
  <nav 
  class="navbar navbar-dark bg-primary bg-gradient px-3 d-flex align-items-center" data-mdb-theme="dark">
    <a @click="$emit('toggle-sidebar')" type="button" class="me-2">
      <i class="fas fa-bars fa-lg text-white"></i>
    </a>
    <h5 class="m-0">Dashboard</h5>
  </nav>
</template>
 
<script setup>
</script>
<style scoped>
.navbar{
 height: 40pt;
}
</style>
