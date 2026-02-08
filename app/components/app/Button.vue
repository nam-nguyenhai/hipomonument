<script setup lang="ts">
interface Props {
  href: string
  showArrow?: boolean
}

withDefaults(defineProps<Props>(), {
  showArrow: true,
})
</script>

<template>
  <div class="pt-2">
    <a
      :href="href"
      class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
    >
      <slot />
      <svg
        v-if="showArrow"
        class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </a>
  </div>
</template>

