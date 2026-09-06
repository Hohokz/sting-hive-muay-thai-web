<template>
  <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 overflow-hidden" @click.stop>
    <div class="absolute top-0 left-0 w-full h-2 bg-green-600"></div>
    <h3 class="text-xl font-black text-gray-900 mb-1">เพิ่มการชำระเงิน</h3>
    <p class="text-xs text-gray-400 mb-6 font-medium uppercase tracking-widest">
      1 การจองสามารถมีรายการชำระเงินได้มากกว่า 1 รายการ
    </p>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 gap-3">
      <div class="w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
      <p class="text-xs text-gray-400 font-medium">กำลังโหลดข้อมูลการชำระเงิน...</p>
    </div>

    <template v-else>
      <div
        v-if="paymentHistory.length > 0"
        class="mb-5 bg-gray-50 rounded-2xl p-4 space-y-2 max-h-36 overflow-y-auto"
      >
        <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">
          รายการที่บันทึกแล้ว ({{ paymentHistory.length }})
        </p>
        <div
          v-for="entry in paymentHistory"
          :key="entry.id"
          class="flex justify-between items-center gap-2 text-xs"
          :class="{ 'opacity-40': editingEntryId === entry.id }"
        >
          <span class="text-gray-500 truncate">{{ entry.payment_method_name || 'ไม่ระบุ' }}</span>
          <span class="font-bold text-gray-700 whitespace-nowrap">
            ค่าเช่า {{ formatBaht(entry.rent_amount) }} / ค่าคอร์ส
            {{ formatBaht(entry.course_amount) }}
          </span>
          <button
            v-if="editingEntryId !== entry.id"
            @click="startEditEntry(entry)"
            :disabled="deletingEntryId === entry.id"
            class="text-blue-500 font-bold hover:underline shrink-0 disabled:opacity-50"
          >
            แก้ไข
          </button>
          <button
            @click="handleDeleteEntry(entry)"
            :disabled="deletingEntryId === entry.id"
            class="text-red-500 font-bold hover:underline shrink-0 disabled:opacity-50"
          >
            {{ deletingEntryId === entry.id ? '...' : 'ลบ' }}
          </button>
        </div>
        <div class="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
          <span class="font-bold text-gray-800">ยอดรวมถึงตอนนี้</span>
          <span class="font-black text-green-700">
            ค่าเช่า {{ formatBaht(paymentTotals.total_rent) }} / ค่าคอร์ส
            {{ formatBaht(paymentTotals.total_course) }}
          </span>
        </div>
      </div>

      <div v-if="editingEntryId" class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-blue-600">กำลังแก้ไขรายการ</span>
        <button
          @click="cancelEditEntry"
          class="text-xs font-bold text-gray-400 hover:text-gray-600 hover:underline"
        >
          + เพิ่มรายการใหม่แทน
        </button>
      </div>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">วิธีชำระเงิน</label>
          <select
            v-model="paymentForm.payment_method_id"
            @change="onMethodSelectChange"
            class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          >
            <option value="">-- เลือกวิธีชำระเงิน --</option>
            <option v-for="m in paymentMethodsList" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
            <option value="__add_new__">+ เพิ่มวิธีชำระเงินใหม่</option>
          </select>
          <div v-if="showAddMethodInput" class="flex gap-2 mt-2">
            <input
              v-model="newMethodName"
              type="text"
              placeholder="ชื่อวิธีชำระเงินใหม่"
              :disabled="isAddingMethod"
              class="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
            />
            <button
              @click="handleAddMethod"
              :disabled="isAddingMethod"
              class="px-4 bg-green-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2"
            >
              <span
                v-if="isAddingMethod"
                class="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"
              ></span>
              {{ isAddingMethod ? 'กำลังเพิ่ม...' : 'เพิ่ม' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">ค่าเช่า (บาท)</label>
          <input
            v-model="paymentForm.rent_amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">ค่าคอร์ส (บาท)</label>
          <input
            v-model="paymentForm.course_amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
        </div>

        <div v-if="!editingEntryId">
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">จำนวน (รายการ)</label>
          <input
            v-model="paymentForm.quantity"
            type="number"
            min="1"
            max="100"
            placeholder="1"
            class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
          <p class="text-[10px] text-gray-400 mt-1">จะสร้างรายการเดียวกันตามจำนวนที่ระบุ</p>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="handleClose"
          class="flex-1 py-3 bg-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-200"
        >
          ยกเลิก
        </button>
        <button
          @click="editingEntryId ? handleUpdatePaymentEntry() : handleSavePayment()"
          :disabled="isSaving"
          class="flex-1 py-3 bg-green-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span
            v-if="isSaving"
            class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
          ></span>
          {{ isSaving ? 'กำลังบันทึก...' : editingEntryId ? 'แก้ไขรายการ' : 'เพิ่มการชำระเงิน' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/bookingApi'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const props = defineProps({
  bookingId: { type: String, required: true },
  // Called after any successful add/edit/delete, so the caller can refresh
  // its own booking list (payment status, note, etc. may have changed).
  onRefresh: Function,
  // Called only if the popup closes without ever saving a payment — lets
  // the caller revert the checkbox it optimistically checked before this
  // opened. Omitted entirely when opened via the "+ Edit" link instead of
  // the checkbox (nothing to revert there).
  onRevertCheckbox: Function,
})

const emit = defineEmits(['close'])

const modalStore = useModalStore()

const showError = (message, title = 'Error') => {
  modalStore.open(StatusModal, { title, message, type: 'error' })
}

const isLoading = ref(false)
const isSaving = ref(false)
const isAddingMethod = ref(false)
const paymentMethodsList = ref([])
const blankPaymentForm = () => ({
  payment_method_id: '',
  rent_amount: '',
  course_amount: '',
  quantity: 1,
})
const paymentForm = ref(blankPaymentForm())
const showAddMethodInput = ref(false)
const newMethodName = ref('')
// Empty = the form is adding a new entry. Set to an entry's id when "Edit"
// is clicked on a history row, so Save updates that entry in place instead
// of creating another one.
const editingEntryId = ref('')
// The entry currently being deleted, so only that row shows a busy state.
const deletingEntryId = ref('')
// A booking can have several payment entries over time (rent this week,
// course fee later), so this is the read-only history shown in the popup —
// the form itself always starts blank, since Save always adds a new entry.
const paymentHistory = ref([])
const paymentTotals = ref({ total_rent: 0, total_course: 0 })
// Whether at least one add/edit succeeded — if the popup closes without
// ever saving, the checkbox that opened it should revert to unchecked.
const hasSaved = ref(false)

const formatBaht = (n) => `฿${Number(n || 0).toLocaleString('th-TH')}`

const refreshPaymentHistory = async () => {
  const res = await api.bookings.getPaymentDetail(props.bookingId)
  paymentHistory.value = res.data.data?.entries || []
  paymentTotals.value = res.data.data?.totals || { total_rent: 0, total_course: 0 }
}

const handleClose = () => {
  if (!hasSaved.value) props.onRevertCheckbox?.()
  emit('close')
}

const onMethodSelectChange = () => {
  if (paymentForm.value.payment_method_id === '__add_new__') {
    showAddMethodInput.value = true
    paymentForm.value.payment_method_id = ''
  }
}

const handleAddMethod = async () => {
  const name = newMethodName.value.trim()
  if (!name || isAddingMethod.value) return
  try {
    isAddingMethod.value = true
    const res = await api.paymentMethods.create(name)
    const created = res.data.data
    const methodsRes = await api.paymentMethods.list()
    paymentMethodsList.value = methodsRes.data.data || []
    paymentForm.value.payment_method_id = created.id
    showAddMethodInput.value = false
    newMethodName.value = ''
  } catch (err) {
    console.error('❌ Add Payment Method Error:', err)
    showError('ไม่สามารถเพิ่มวิธีชำระเงินได้', 'เพิ่มไม่สำเร็จ')
  } finally {
    isAddingMethod.value = false
  }
}

const handleSavePayment = async () => {
  try {
    isSaving.value = true
    await api.bookings.updatePayment(props.bookingId, {
      is_paid: true,
      payment_method_id: paymentForm.value.payment_method_id || null,
      rent_amount: Number(paymentForm.value.rent_amount) || 0,
      course_amount: Number(paymentForm.value.course_amount) || 0,
      quantity: Number(paymentForm.value.quantity) || 1,
    })
    hasSaved.value = true
    props.onRefresh?.()

    // Stay open and refresh the history — a booking often gets more than
    // one entry in a row, so just reset the form for the next one instead
    // of closing.
    paymentForm.value = blankPaymentForm()
    await refreshPaymentHistory()
  } catch (err) {
    console.error('❌ Save Payment Error:', err)
    showError('ไม่สามารถบันทึกข้อมูลการชำระเงินได้', 'บันทึกไม่สำเร็จ')
  } finally {
    isSaving.value = false
  }
}

const startEditEntry = (entry) => {
  editingEntryId.value = entry.id
  paymentForm.value = {
    ...blankPaymentForm(),
    payment_method_id: entry.payment_method_id || '',
    rent_amount: entry.rent_amount || '',
    course_amount: entry.course_amount || '',
  }
}

const cancelEditEntry = () => {
  editingEntryId.value = ''
  paymentForm.value = blankPaymentForm()
}

const handleUpdatePaymentEntry = async () => {
  if (!editingEntryId.value || isSaving.value) return
  try {
    isSaving.value = true
    await api.bookings.updatePaymentEntry(editingEntryId.value, {
      payment_method_id: paymentForm.value.payment_method_id || null,
      rent_amount: Number(paymentForm.value.rent_amount) || 0,
      course_amount: Number(paymentForm.value.course_amount) || 0,
    })
    hasSaved.value = true
    props.onRefresh?.()

    editingEntryId.value = ''
    paymentForm.value = blankPaymentForm()
    await refreshPaymentHistory()
  } catch (err) {
    console.error('❌ Update Payment Entry Error:', err)
    showError('ไม่สามารถแก้ไขรายการชำระเงินได้', 'แก้ไขไม่สำเร็จ')
  } finally {
    isSaving.value = false
  }
}

const runDeletePaymentEntry = async (entryId) => {
  try {
    deletingEntryId.value = entryId
    await api.bookings.deletePaymentEntry(entryId)
    props.onRefresh?.()
    if (editingEntryId.value === entryId) cancelEditEntry()
    await refreshPaymentHistory()
  } catch (err) {
    console.error('❌ Delete Payment Entry Error:', err)
    showError('ไม่สามารถลบรายการชำระเงินได้', 'ลบไม่สำเร็จ')
  } finally {
    deletingEntryId.value = ''
  }
}

const handleDeleteEntry = (entry) => {
  modalStore.open(ConfirmModal, {
    title: 'ลบรายการชำระเงินนี้?',
    message: `การดำเนินการนี้จะลบ ค่าเช่า ${formatBaht(entry.rent_amount)} / ค่าคอร์ส ${formatBaht(entry.course_amount)} อย่างถาวร ไม่สามารถย้อนกลับได้`,
    confirmText: 'ลบ',
    type: 'danger',
    onConfirm: () => runDeletePaymentEntry(entry.id),
  })
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [methodsRes] = await Promise.all([api.paymentMethods.list(), refreshPaymentHistory()])
    paymentMethodsList.value = methodsRes.data.data || []
  } catch (err) {
    console.error('❌ Load Payment Modal Error:', err)
  } finally {
    isLoading.value = false
  }
})
</script>
