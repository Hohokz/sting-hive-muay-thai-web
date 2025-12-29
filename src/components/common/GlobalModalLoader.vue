<template>
  <Teleport to="body">
    <div
      v-if="modalStore.stack.length > 0"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    >
      <!-- Backdrop (Clicking it closes the top modal if desired, or we can make it blocking) -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="handleBackdropClick"
      ></div>

      <!-- Render the top-most modal in the stack -->
      <!-- We loop to keep state of stacked modals if we want them visible behind,
           or just render the last one. Usually, just proper z-indexing or rendering the last one is enough.
           Let's render ALL of them to support stacking visuals if needed, or valid overlapping.
      -->
      <div
        v-for="(modal, index) in modalStore.stack"
        :key="modal.id"
        class="z-[1001] relative"
        :style="{ zIndex: 1001 + index }"
      >
        <component
          :is="modal.component"
          v-bind="modal.props"
          @close="modalStore.closeById(modal.id)"
          @success="handleSuccess(modal)"
        />
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
