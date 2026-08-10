import type { Ref } from 'vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useResize(): { width: Ref<number>; height: Ref<number> } {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  const onResize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  return { width, height }
}
