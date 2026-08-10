import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarOpened = ref(true)
    const sidebarWithoutAnimation = ref(false)
    const sidebarIconOnly = ref(false)
    const device = ref('desktop')
    const size = ref('default')

    function toggleSidebar() {
      sidebarOpened.value = !sidebarOpened.value
      sidebarWithoutAnimation.value = false
    }

    function closeSidebar(withoutAnimation: boolean) {
      sidebarOpened.value = false
      sidebarWithoutAnimation.value = withoutAnimation
    }

    function toggleSidebarIconOnly() {
      sidebarIconOnly.value = !sidebarIconOnly.value
    }

    function setSidebarIconOnly(iconOnly: boolean) {
      sidebarIconOnly.value = iconOnly
    }

    function toggleDevice(val: string) {
      device.value = val
    }

    function setSize(val: string) {
      size.value = val
    }

    return {
      sidebarOpened,
      sidebarWithoutAnimation,
      sidebarIconOnly,
      device,
      size,
      toggleSidebar,
      closeSidebar,
      toggleSidebarIconOnly,
      setSidebarIconOnly,
      toggleDevice,
      setSize,
    }
  },
  {
    persist: {
      pick: ['sidebarOpened', 'size'],
    },
  },
)
