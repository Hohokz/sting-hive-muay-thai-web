<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">User Management</h2>
          <p class="text-gray-500 text-sm">Manage staff and admin access</p>
        </div>
        <button
          @click="openAddModal"
          class="bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
        >
          <span class="text-xl">+</span> Add New User
        </button>
      </div>

      <div class="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email or username..."
            class="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead
            class="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            <tr>
              <th class="px-6 py-4">User Details</th>
              <th class="px-6 py-4">Contact</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4 text-center">Status</th>
              <th class="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="isLoading">
              <td colspan="5" class="py-20 text-center">
                <div
                  class="inline-block w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"
                ></div>
                <p class="mt-2 text-gray-400 font-medium">Loading users...</p>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="py-20 text-center text-gray-400 font-medium">
                No users found matching your search.
              </td>
            </tr>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900">{{ user.name }}</div>
                <div class="text-xs text-gray-400">@{{ user.username }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-gray-700 font-medium">{{ user.email }}</div>
                <div class="text-xs text-gray-400">{{ user.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight"
                  :class="
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                  "
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="user.is_active ? 'bg-green-500' : 'bg-gray-300'"
                  ></span>
                  <span
                    class="font-medium"
                    :class="user.is_active ? 'text-gray-700' : 'text-gray-400'"
                  >
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-4">
                  <button
                    @click="openEditModal(user)"
                    class="text-gray-400 hover:text-black font-bold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showFormModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showFormModal = false"
        ></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <h3 class="text-2xl font-black text-gray-900 mb-6">
            {{ isEditMode ? 'Update Profile' : 'Create Account' }}
          </h3>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                <input
                  v-model="form.username"
                  type="text"
                  :disabled="isEditMode"
                  class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  required
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  :placeholder="isEditMode ? '••••••••' : 'Required'"
                  class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  :required="!isEditMode"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Phone</label>
                <input
                  v-model="form.phone"
                  type="text"
                  class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Role</label>
                <select
                  v-model="form.role"
                  class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black appearance-none"
                >
                  <option value="USER">User (Staff)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="showFormModal = false"
                class="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-black/20"
              >
                {{ isSubmitting ? 'Processing...' : isEditMode ? 'Save Changes' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showConfirmModal = false"
        ></div>
        <div class="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div
            class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
          >
            ⚠️
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-2">Are you sure?</h3>
          <p class="text-gray-500 mb-8 leading-relaxed">
            You are about to delete
            <span class="font-bold text-gray-900">{{ userToDelete?.name }}</span
            >. This action is irreversible.
          </p>
          <div class="flex gap-4">
            <button
              @click="showConfirmModal = false"
              class="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600"
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              :disabled="isDeleting"
              class="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 disabled:opacity-50"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ✅ STATUS MODAL -->
    <Teleport to="body">
      <div
        v-if="showStatusModal"
        class="fixed inset-0 z-[11000] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="showStatusModal = false"
        ></div>
        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fadeIn"
        >
          <div class="text-3xl mb-4">{{ modalType === 'success' ? '✅' : '⚠️' }}</div>
          <h3 class="text-xl font-bold mb-2">{{ modalTitle }}</h3>
          <p class="text-gray-500 mb-6">{{ modalMessage }}</p>
          <button
            @click="showStatusModal = false"
            class="w-full py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/bookingApi'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'

// ✅ STATE
const users = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')

const showFormModal = ref(false)
const isEditMode = ref(false)
const selectedUserId = ref(null)
const form = ref({ username: '', password: '', name: '', email: '', phone: '', role: 'USER' })

const showConfirmModal = ref(false)
const userToDelete = ref(null)
const isDeleting = ref(false)

// ✅ STATUS MODAL STATE
const showStatusModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('success')

const openStatusModal = (title, message, type = 'success') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  showStatusModal.value = true
}

// ✅ ACTIONS
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const res = await api.auth.getUser()
    users.value = res.data.data
  } catch (err) {
    console.error('Fetch error:', err)
    openStatusModal('Error', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้', 'error')
  } finally {
    isLoading.value = false
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q),
  )
})

const openAddModal = () => {
  isEditMode.value = false
  form.value = { username: '', password: '', name: '', email: '', phone: '', role: 'USER' }
  showFormModal.value = true
}

const openEditModal = (user) => {
  isEditMode.value = true
  selectedUserId.value = user.id
  form.value = { ...user, password: '' }
  showFormModal.value = true
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      // ✅ Updated Payload to include more fields
      const payload = {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        role: form.value.role,
      }
      if (form.value.password) payload.password = form.value.password
      await api.auth.updateUser(selectedUserId.value, payload)
    } else {
      await api.auth.createUser(form.value)
    }
    await fetchUsers()
    showFormModal.value = false
    openStatusModal(
      'Success',
      isEditMode.value ? 'User updated successfully' : 'User created successfully',
      'success',
    )
  } catch (err) {
    openStatusModal('Error', err.response?.data?.message || 'Error processing request', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (user) => {
  userToDelete.value = user
  showConfirmModal.value = true
}

const handleDelete = async () => {
  try {
    isDeleting.value = true
    await api.auth.deleteUser(userToDelete.value.id)
    users.value = users.value.filter((u) => u.id !== userToDelete.value.id)
    showConfirmModal.value = false
    openStatusModal('Success', 'User deleted successfully', 'success')
  } catch {
    openStatusModal('Error', 'Delete failed', 'error')
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchUsers)
</script>
