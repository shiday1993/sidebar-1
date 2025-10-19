<template>
  <div class="app-container h-100">
    <Sidebar ref="sidebarRef" @toggled="sidebarExpanded = $event" />
     <div 
      v-if="sidebarExpanded" 
      class="sidebar-backdrop d-md-none" 
      @click="closeSidebar">
    </div>
    <div class="main-content" :class="{ expanded: sidebarExpanded }">
      <Navbar @toggle-sidebar="toggleSidebar" />
      <div class="container-fluid mt-2">
        <router-view />
      </div>
       <footer class="text-center p-2">
        <img src="" height="20" alt="KL Sistem Logo" loading="lazy" class="d-inline-block align-center">
        © 2025
        <a class="text-reset fw-bold" href="/">KL Sistem. All rights reserved.</a>
    </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/layouts/SidebarLayout.vue'
import Navbar from '@/layouts/NavbarLayout.vue'

const sidebarRef = ref(null)
const sidebarExpanded = ref(false)

function toggleSidebar() {
  sidebarRef.value.toggleSidebar()
}

function closeSidebar() {
  if (window.innerWidth < 768 && sidebarExpanded.value) {
    sidebarRef.value.toggleSidebar()
  }
}
</script>

<style>
.app-container {
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: 250px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100%;
    top: 0;
    left: -250px;
    width: 250px;
    transition: left 0.3s ease;
    z-index: 1050;
  }

  .sidebar.expanded {
    left: 0; 
  }

  .main-content {
    margin-left: 0 !important;
  }
}
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

</style>
