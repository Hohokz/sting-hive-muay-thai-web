<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">สรุปยอดชำระเงิน</h1>
        <p class="text-sm text-gray-500 font-medium">
          ยอดรวมที่เก็บได้ แยกตามวิธีชำระเงินและแยกตามคลาส
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex gap-2">
          <button
            v-for="tab in PERIOD_TABS"
            :key="tab.value"
            @click="selectedPeriod = tab.value"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors"
            :class="
              selectedPeriod === tab.value
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <input
          v-if="selectedPeriod === 'day'"
          v-model="periodValue.day"
          type="date"
          class="border border-gray-200 rounded-xl px-4 py-2 text-sm"
        />
        <input
          v-else-if="selectedPeriod === 'week'"
          v-model="periodValue.week"
          type="week"
          class="border border-gray-200 rounded-xl px-4 py-2 text-sm"
        />
        <input
          v-else-if="selectedPeriod === 'month'"
          v-model="periodValue.month"
          type="month"
          class="border border-gray-200 rounded-xl px-4 py-2 text-sm"
        />
        <input
          v-else-if="selectedPeriod === 'year'"
          v-model="periodValue.year"
          type="number"
          min="2000"
          max="2100"
          class="border border-gray-200 rounded-xl px-4 py-2 text-sm w-28"
        />

        <button
          @click="handleExport"
          :disabled="isExporting || !currentValue"
          class="ml-auto px-4 py-2 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wide disabled:opacity-50 flex items-center gap-2"
        >
          <span
            v-if="isExporting"
            class="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"
          ></span>
          {{ isExporting ? 'กำลังส่งออก...' : 'ส่งออกข้อมูล' }}
        </button>
      </div>

      <div class="flex gap-2">
        <button
          v-for="branch in BRANCH_TABS"
          :key="branch.value"
          @click="selectedGym = branch.value"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          :class="
            selectedGym === branch.value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          "
        >
          {{ branch.label }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">ค่าเช่ารวม</p>
          <p class="text-2xl font-black text-gray-900">
            {{ formatCurrency(summary.totals.total_rent) }}
          </p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">ค่าคอร์สรวม</p>
          <p class="text-2xl font-black text-gray-900">
            {{ formatCurrency(summary.totals.total_course) }}
          </p>
        </div>
        <div class="bg-black rounded-2xl p-5">
          <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">รวมทั้งหมด</p>
          <p class="text-2xl font-black text-white">
            {{ formatCurrency(summary.totals.total_amount) }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-bold text-gray-900">แยกตามวิธีชำระเงิน</h2>
        </div>
        <div v-if="loadingSummary" class="p-10 text-center text-gray-400">กำลังโหลด...</div>
        <div v-else-if="summary.by_method.length === 0" class="p-10 text-center text-gray-400">
          ไม่มีข้อมูลการชำระเงินในช่วงนี้
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-500">
              <tr>
                <th class="px-5 py-3">วิธีชำระเงิน</th>
                <th class="px-5 py-3 text-right">จำนวนครั้ง</th>
                <th class="px-5 py-3 text-right">ค่าเช่า</th>
                <th class="px-5 py-3 text-right">ค่าคอร์ส</th>
                <th class="px-5 py-3 text-right">รวม</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in summary.by_method"
                :key="row.payment_method_id || 'none'"
                class="border-t border-gray-50"
              >
                <td class="px-5 py-3 font-semibold text-gray-800">
                  {{ row.payment_method_name }}
                </td>
                <td class="px-5 py-3 text-right">{{ row.payment_count }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(row.total_rent) }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(row.total_course) }}</td>
                <td class="px-5 py-3 text-right font-bold">
                  {{ formatCurrency(row.total_amount) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 bg-gray-50 font-bold text-gray-900">
                <td class="px-5 py-3">รวมทั้งหมด</td>
                <td class="px-5 py-3 text-right">{{ summary.totals.payment_count }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(summary.totals.total_rent) }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(summary.totals.total_course) }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(summary.totals.total_amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-bold text-gray-900">แยกตามคลาส</h2>
        </div>
        <div v-if="loadingSummary" class="p-10 text-center text-gray-400">กำลังโหลด...</div>
        <div v-else-if="summary.by_class.length === 0" class="p-10 text-center text-gray-400">
          ไม่มีข้อมูลการชำระเงินในช่วงนี้
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-500">
              <tr>
                <th class="px-5 py-3">คลาส</th>
                <th class="px-5 py-3 text-right">จำนวนครั้ง</th>
                <th class="px-5 py-3 text-right">ค่าเช่า</th>
                <th class="px-5 py-3 text-right">ค่าคอร์ส</th>
                <th class="px-5 py-3 text-right">รวม</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in summary.by_class"
                :key="row.schedule_id"
                @click="openClassDetail(row)"
                class="border-t border-gray-50 cursor-pointer hover:bg-gray-50"
              >
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-800">
                      {{ formatTime(row.start_time) }} - {{ formatTime(row.end_time) }}
                    </span>
                    <span class="text-gray-400">({{ formatGym(row.gym_enum) }})</span>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                      :class="
                        row.is_private_class
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      "
                    >
                      {{ row.is_private_class ? 'ส่วนตัว' : 'กลุ่ม' }}
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3 text-right">{{ row.payment_count }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(row.total_rent) }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(row.total_course) }}</td>
                <td class="px-5 py-3 text-right font-bold">
                  {{ formatCurrency(row.total_amount) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 bg-gray-50 font-bold text-gray-900">
                <td class="px-5 py-3">รวมทั้งหมด</td>
                <td class="px-5 py-3 text-right">{{ summary.totals.payment_count }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(summary.totals.total_rent) }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(summary.totals.total_course) }}</td>
                <td class="px-5 py-3 text-right">{{ formatCurrency(summary.totals.total_amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 class="font-bold text-gray-900">จัดการวิธีชำระเงิน</h2>
        <div class="flex gap-2">
          <input
            v-model="newMethodName"
            type="text"
            placeholder="ชื่อวิธีชำระเงินใหม่"
            class="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
          />
          <button
            @click="handleAddMethod"
            :disabled="isAddingMethod"
            class="px-5 py-2 bg-black text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2"
          >
            <span
              v-if="isAddingMethod"
              class="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"
            ></span>
            {{ isAddingMethod ? 'กำลังเพิ่ม...' : 'เพิ่ม' }}
          </button>
        </div>
        <div v-if="loadingMethods" class="text-sm text-gray-400 py-4 flex items-center gap-2">
          <span
            class="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin"
          ></span>
          กำลังโหลดวิธีชำระเงิน...
        </div>
        <div v-else-if="allMethods.length === 0" class="text-sm text-gray-400 italic py-2">
          ยังไม่มีวิธีชำระเงิน
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="m in allMethods"
            :key="m.id"
            class="flex items-center justify-between py-3 gap-3"
          >
            <div v-if="editingMethodId !== m.id" class="font-medium text-gray-800">
              {{ m.name }}
            </div>
            <input
              v-else
              v-model="editingMethodName"
              :disabled="busyMethodId === m.id"
              class="flex-1 bg-gray-50 rounded-lg px-3 py-1 text-sm disabled:opacity-50"
            />
            <div class="flex items-center gap-3 text-xs font-bold whitespace-nowrap">
              <span
                v-if="busyMethodId === m.id"
                class="w-3 h-3 border-2 border-gray-200 border-t-black rounded-full animate-spin"
              ></span>
              <span v-else :class="m.is_active ? 'text-green-600' : 'text-gray-400'">
                {{ m.is_active ? 'ใช้งานอยู่' : 'ปิดใช้งาน' }}
              </span>
              <button
                v-if="editingMethodId !== m.id"
                @click="startEditMethod(m)"
                :disabled="busyMethodId === m.id"
                class="text-blue-500 hover:underline disabled:opacity-50 disabled:no-underline"
              >
                แก้ไขชื่อ
              </button>
              <button
                v-else
                @click="saveEditMethod(m)"
                :disabled="busyMethodId === m.id"
                class="text-blue-500 hover:underline disabled:opacity-50 disabled:no-underline"
              >
                บันทึก
              </button>
              <button
                @click="toggleMethodActive(m)"
                :disabled="busyMethodId === m.id"
                class="text-gray-500 hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {{ m.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CLASS DETAIL MODAL -->
    <Teleport to="body">
      <div
        v-if="showClassDetailModal"
        class="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showClassDetailModal = false"
        ></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-black"></div>
          <div class="p-8 pb-4">
            <h3 class="text-xl font-black text-gray-900 mb-1">รายละเอียดคลาส</h3>
            <p v-if="classDetailContext" class="text-sm text-gray-500 font-medium">
              {{ formatTime(classDetailContext.start_time) }} -
              {{ formatTime(classDetailContext.end_time) }}
              ({{ formatGym(classDetailContext.gym_enum) }},
              {{ classDetailContext.is_private_class ? 'ส่วนตัว' : 'กลุ่ม' }})
            </p>
          </div>

          <div class="flex-1 overflow-y-auto px-8">
            <div v-if="loadingClassDetail" class="p-10 text-center text-gray-400">
              กำลังโหลด...
            </div>
            <div v-else-if="classDetailEntries.length === 0" class="p-10 text-center text-gray-400">
              ไม่มีข้อมูลการชำระเงินในช่วงนี้
            </div>
            <div v-else class="overflow-x-auto pb-4">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-left text-gray-500 sticky top-0">
                  <tr>
                    <th class="px-3 py-2">วันที่จอง</th>
                    <th class="px-3 py-2">ลูกค้า</th>
                    <th class="px-3 py-2">วิธีชำระเงิน</th>
                    <th class="px-3 py-2 text-right">ค่าเช่า</th>
                    <th class="px-3 py-2 text-right">ค่าคอร์ส</th>
                    <th class="px-3 py-2 text-right">รวม</th>
                    <th class="px-3 py-2">บันทึกเมื่อ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(entry, idx) in classDetailEntries"
                    :key="idx"
                    class="border-t border-gray-50"
                  >
                    <td class="px-3 py-2 whitespace-nowrap">{{ entry.date_booking }}</td>
                    <td class="px-3 py-2">{{ entry.client_name }}</td>
                    <td class="px-3 py-2">{{ entry.payment_method }}</td>
                    <td class="px-3 py-2 text-right">{{ formatCurrency(entry.rent_amount) }}</td>
                    <td class="px-3 py-2 text-right">{{ formatCurrency(entry.course_amount) }}</td>
                    <td class="px-3 py-2 text-right font-bold">
                      {{ formatCurrency(entry.total_amount) }}
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap text-gray-400 text-xs">
                      {{ entry.created_date }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="p-8 pt-4">
            <button
              @click="showClassDetailModal = false"
              class="w-full py-3 bg-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-200"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import { api } from '@/api/bookingApi'
import { downloadBlobResponse } from '@/utils/downloadBlob'

const pad = (n) => String(n).padStart(2, '0')

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const currentMonthStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}
const currentYearStr = () => String(new Date().getFullYear())
// Standard ISO-8601 week calculation, matching what <input type="week"> expects/produces.
const currentIsoWeekStr = () => {
  const now = new Date()
  const target = new Date(now.valueOf())
  const dayNr = (now.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7))
  }
  const week = 1 + Math.round((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000))
  const year = new Date(firstThursday).getFullYear()
  return `${year}-W${pad(week)}`
}

const PERIOD_TABS = [
  { value: 'day', label: 'วัน' },
  { value: 'week', label: 'สัปดาห์' },
  { value: 'month', label: 'เดือน' },
  { value: 'year', label: 'ปี' },
]

const selectedPeriod = ref('month')
const periodValue = ref({
  day: todayStr(),
  week: currentIsoWeekStr(),
  month: currentMonthStr(),
  year: currentYearStr(),
})
const currentValue = computed(() => periodValue.value[selectedPeriod.value])

// '' means every branch combined.
const BRANCH_TABS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'STING_HIVE', label: 'Sting Hive' },
  { value: 'STING_CLUB', label: 'Sting Club' },
]
const selectedGym = ref('')

const loadingSummary = ref(true)
const summary = ref({
  totals: { payment_count: 0, total_rent: 0, total_course: 0, total_amount: 0 },
  by_method: [],
  by_class: [],
})

const allMethods = ref([])
const loadingMethods = ref(true)
const isAddingMethod = ref(false)
const newMethodName = ref('')
const editingMethodId = ref('')
const editingMethodName = ref('')
// The single payment-method row currently being renamed/toggled, so only
// that row shows a busy state instead of locking the whole list.
const busyMethodId = ref('')

const formatCurrency = (n) =>
  `฿${Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatTime = (t) => t?.slice(0, 5) || '--:--'
const formatGym = (g) =>
  g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : '-'

const loadSummary = async () => {
  if (!currentValue.value) return
  loadingSummary.value = true
  try {
    const res = await api.payments.getSummary({
      period: selectedPeriod.value,
      value: currentValue.value,
      gym: selectedGym.value || undefined,
    })
    summary.value = res.data.data
  } catch (err) {
    console.error('Failed to load payment summary:', err)
  } finally {
    loadingSummary.value = false
  }
}

const showClassDetailModal = ref(false)
const loadingClassDetail = ref(false)
const classDetailContext = ref(null)
const classDetailEntries = ref([])

const openClassDetail = async (row) => {
  classDetailContext.value = row
  classDetailEntries.value = []
  showClassDetailModal.value = true
  loadingClassDetail.value = true
  try {
    const res = await api.payments.getClassDetails(row.schedule_id, {
      period: selectedPeriod.value,
      value: currentValue.value,
      gym: selectedGym.value || undefined,
    })
    classDetailEntries.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load class payment details:', err)
  } finally {
    loadingClassDetail.value = false
  }
}

const isExporting = ref(false)

const handleExport = async () => {
  if (!currentValue.value || isExporting.value) return
  isExporting.value = true
  try {
    const response = await api.payments.exportSummary({
      period: selectedPeriod.value,
      value: currentValue.value,
      gym: selectedGym.value || undefined,
    })
    const gymSuffix = selectedGym.value ? `_${selectedGym.value}` : ''
    downloadBlobResponse(
      response,
      `payment_summary_${selectedPeriod.value}_${currentValue.value}${gymSuffix}.xlsx`,
    )
  } catch (err) {
    console.error('Failed to export payment summary:', err)
  } finally {
    isExporting.value = false
  }
}

const loadMethods = async () => {
  loadingMethods.value = true
  try {
    const res = await api.paymentMethods.list({ include_inactive: true })
    allMethods.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load payment methods:', err)
  } finally {
    loadingMethods.value = false
  }
}

const handleAddMethod = async () => {
  const name = newMethodName.value.trim()
  if (!name || isAddingMethod.value) return
  try {
    isAddingMethod.value = true
    await api.paymentMethods.create(name)
    newMethodName.value = ''
    await loadMethods()
  } catch (err) {
    console.error('Failed to add payment method:', err)
  } finally {
    isAddingMethod.value = false
  }
}

const startEditMethod = (m) => {
  editingMethodId.value = m.id
  editingMethodName.value = m.name
}

const saveEditMethod = async (m) => {
  const name = editingMethodName.value.trim()
  if (!name || busyMethodId.value) return
  try {
    busyMethodId.value = m.id
    await api.paymentMethods.update(m.id, { name })
    editingMethodId.value = ''
    await loadMethods()
  } catch (err) {
    console.error('Failed to rename payment method:', err)
  } finally {
    busyMethodId.value = ''
  }
}

const toggleMethodActive = async (m) => {
  if (busyMethodId.value) return
  try {
    busyMethodId.value = m.id
    await api.paymentMethods.update(m.id, { is_active: !m.is_active })
    await loadMethods()
  } catch (err) {
    console.error('Failed to toggle payment method:', err)
  } finally {
    busyMethodId.value = ''
  }
}

watch([selectedPeriod, currentValue, selectedGym], loadSummary)

onMounted(() => {
  loadSummary()
  loadMethods()
})
</script>
