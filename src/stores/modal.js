import { defineStore } from 'pinia'
import { markRaw, ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const stack = ref([])

  /**
   * Open a component as a modal
   * @param {Object} component - The Vue component to render
   * @param {Object} props - Props to pass to the component
   */
  const open = (component, props = {}) => {
    stack.value.push({
      component: markRaw(component),
      props,
      id: Date.now() + Math.random(),
    })
  }

  /**
   * Close the top-most modal
   */
  const close = () => {
    stack.value.pop()
  }

  /**
   * Close specific modal by ID
   */
  const closeById = (id) => {
    const index = stack.value.findIndex((m) => m.id === id)
    if (index !== -1) {
      stack.value.splice(index, 1)
    }
  }

  /**
   * Close all modals
   */
  const closeAll = () => {
    stack.value = []
  }

  /**
   * Open a standard status modal (Success / Error / Warning)
   * This relies on having a StatusModal component registered or passed.
   * We'll allow passing the specific StatusComponent when calling this or importing it directly if circular deps aren't an issue.
   * For cleaner architecture, we will simply expose a specific method that opens a specific InternalStatus Component.
   * But to avoid circular imports here, we might just use `open`.
   */

  return {
    stack,
    open,
    close,
    closeById,
    closeAll,
  }
})
