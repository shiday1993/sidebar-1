<template>
  <aside :class="['sidebar', { expanded: isExpanded }]">
    <!-- Header Sidebar -->
    <div class="sidebar-header">
      <i class="fas fa-hospital-alt"></i>
      <span class="sidebar-title">My Klinik</span>
    </div>

    <!-- Menu Navigasi -->
    <nav class="sidebar-menu">
      <ul>
        <li>
          <RouterLink to="/" class="nav-link">
            <i class="fas fa-home"></i>
            <span class="sidebar-label">Dashboard</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/patients" class="nav-link">
            <i class="fas fa-users"></i>
            <span class="sidebar-label">Patients</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/settings" class="nav-link">
            <i class="fas fa-cog"></i>
            <span class="sidebar-label">Settings</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Collapse, Ripple, initMDB } from 'mdb-ui-kit'
const emit = defineEmits(['toggled'])
const isExpanded = ref(false)

onMounted(() => {
  initMDB({ Collapse, Ripple })
})


function toggleSidebar() {
  isExpanded.value = !isExpanded.value
  emit('toggled', isExpanded.value)   // ⬅️ kirim status ke parent
}

defineExpose({
  toggleSidebar
})
</script>

<style scoped>
@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
  }
  .sidebar.expanded {
    position: fixed;
    width: 250px;
    z-index: 1050;
  }
}

.sidebar {
  width: 60px;
  background-color: #083579;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 1030;
}

.sidebar.expanded {
  width: 250px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1.2rem;
  padding: 0 1rem;
  white-space: nowrap;
}

.sidebar-title {
  display: none;
}

.sidebar.expanded .sidebar-title {
  display: inline;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.nav-link i {
  width: 25px;
  text-align: center;
  font-size: 1.3rem;
  margin-right: 0;
  transition: margin-right 0.3s;
}

.sidebar.expanded .nav-link i {
  margin-right: 10px;
}

.nav-link:hover {
  background-color: #5090d180;
}

.sidebar-label {
  display: none;
}

.sidebar.expanded .sidebar-label {
  display: inline;
}
</style>
