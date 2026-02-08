<script setup lang="ts">
interface Props {
  href?: string
  variant?: 'primary' | 'secondary'
  showArrow?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  showArrow: true,
  size: 'lg',
})

const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300'

const variantClasses = {
  primary: 'bg-gold hover:bg-gold-dark text-black shadow-lg hover:shadow-xl hover:scale-105',
  secondary: 'border-2 border-gold text-gray-700 hover:bg-gold/10 hover:scale-105 hover:shadow-md',
}

const sizeClasses = {
  sm: 'px-4 py-2.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-base',
}

const classes = computed(() => {
  return [baseClasses, variantClasses[props.variant], sizeClasses[props.size]].join(' ')
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :class="classes"
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
  </component>
</template>

