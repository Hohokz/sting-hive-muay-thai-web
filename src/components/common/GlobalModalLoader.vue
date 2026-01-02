<template>
  <Teleport to="body">
    <div v-if="modalStore.stack.length > 0" class="fixed inset-0 z-[1000]">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="handleBackdropClick"
      ></div>

      <!-- Render all modals in the stack, centered and stacked -->
      <div
        v-for="(modal, index) in modalStore.stack"
        :key="modal.id"
        class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
        :style="{ zIndex: 1001 + index }"
      >
        <div class="relative pointer-events-auto max-w-full max-h-full">
          <component
            :is="modal.component"
            v-bind="modal.props"
            @close="modalStore.closeById(modal.id)"
            @success="handleSuccess(modal)"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()

const handleBackdropClick = () => {
  // Optional: Close top modal on backdrop click
  // modalStore.close()
}

const handleSuccess = (modal) => {
  if (modal.props.onSuccess) {
    modal.props.onSuccess()
  }
  modalStore.closeById(modal.id)
}
</script>
