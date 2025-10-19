<template>
  <div class="vh-100 bg-light d-flex flex-column">
    <!-- Navbar -->
    <nav class="navbar bg-primary bg-gradient" data-mdb-theme="dark">
      <div class="container-fluid">
        <a class="navbar-brand ms-4 d-flex align-items-center gap-2" href="#">
          <img src="" height="22" alt="Logo" loading="lazy" />
        </a>
      </div>
    </nav>

    <!-- Login Section -->
    <section class="flex-grow-1 d-flex align-items-center justify-content-center g-2">
      <div class="container">
        <div class="row justify-content-center align-items-center text-center">
          <div class="col-md-4 col-lg-4">
            <img
              src="https://t4.ftcdn.net/jpg/03/04/06/01/360_F_304060171_OUUSKIITlOLRgnDI1EFO8eSZqOHab6Iq.jpg"
              alt="gambarlogo "
            />
          </div>
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-3-strong rounded-4 p-3 border-0">
              <h3 class="text-center mb-4 fw-bold text-primary">Silahkan Login</h3>

              <form @submit.prevent="handleSubmit" novalidate class="mx-2 mx-md-2">
                <!-- Username -->
                <div class="input-group mb-3">
                  <span class="input-group-text border-0" id="basic-addon1">
                    <i class="fas fa-user fa-lg fa-fw"></i>
                    <span class="ms-2">Username</span>
                  </span>
                  <input
                    type="text"
                    class="form-control rounded"
                    id="username"
                    placeholder="Username"
                    v-model="form.username"
                    :class="{ 'is-invalid': errors.username }"
                    required
                  />
                </div>

                <!-- Password -->
                <div class="position-relative mb-3">
                  <div class="input-group">
                    <span class="input-group-text border-0" id="basic-addon">
                      <i class="fas fa-lock fa-lg fa-fw"></i>
                      <span class="ms-2">Password</span>
                    </span>
                    <input
                      class="form-control rounded"
                      id="password"
                      placeholder="Password"
                      :type="showPassword ? 'text' : 'password'"
                      v-model="form.password"
                      :class="{ 'is-invalid': errors.password }"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    class="btn btn-link btn-sm text-muted position-absolute end-0 top-50 translate-middle-y me-2"
                    @click="togglePassword"
                    tabindex="-1"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>

                <!-- Global Error Message -->
                <div v-if="globalError" class="text-danger text-center mb-3 fw-semibold">
                  {{ globalError }}
                </div>

                <!-- Submit -->
                <div class="text-center">
                  <button
                    class="btn btn-primary w-75"
                    type="submit"
                    data-mdb-ripple-init
                    :disabled="loading"
                  >
                    <span v-if="!loading">Masuk</span>
                    <span v-else>Memproses...</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="text-center p-2">
      <img
        src=""
        height="20"
        alt="KL Sistem Logo"
        loading="lazy"
        class="d-inline-block align-center"
      />
      © 2025
      <a class="text-reset fw-bold" href="/">KL Sistem. All rights reserved.</a>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { Input, Ripple, initMDB } from 'mdb-ui-kit'
import Swal from 'sweetalert2'

onMounted(() => {
  initMDB({ Input, Ripple })
})

const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const globalError = ref('')

function validate() {
  let ok = true
  errors.username = ''
  errors.password = ''
  globalError.value = ''

  if (!form.username) {
    errors.username = 'Username tidak boleh kosong'
    ok = false
  }
  if (!form.password) {
    errors.password = 'Password tidak bolek kosong'
    ok = false
  } else if (form.password.length < 6) {
    errors.password = 'Password min. 6 karakter'
    ok = false
  }

  if (!ok) {
    globalError.value = errors.username || errors.password
  }
  return ok
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  globalError.value = ''

  try {
    const correctUser = 'admin'
    const correctPass = 'admin100%'
    if (form.username === correctUser && form.password === correctPass) {
      const data = { token: 'jwt-key-secret' }
      localStorage.setItem('auth_token', data.token)
      await Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        showConfirmButton: false,
        timer: 1500,
      })
      window.location.href = '/'
    } else {
      throw new Error('Username atau password salah')
    }
  } catch (error) {
    console.error('Error:', error)
    globalError.value = 'Username atau password salah'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.navbar {
  height: 60px;
}

.card {
  border-radius: 1rem;
}

button.btn-link {
  text-decoration: none;
}

button.btn-link:hover i {
  color: #0d6efd;
}

.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.1rem rgba(220, 53, 69, 0.15);
}
</style>
