<template>
  <div class="flex flex-col items-center justify-center border border-gray-300 font-sans rounded-lg p-5 shadow w-full h-40 text-center break-words"
    :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-200 text-gray-600'">
    <h3 class="font-semibold text-lg leading-tight">{{ title }}</h3>
    <div v-if="value !== null" class="mt-2 text-xl leading-snug truncate">{{ value }}</div>
    <div v-if="$slots.default" class="mt-4 text-left w-full text-sm">
      <slot />
    </div>
  </div>
</template>

<script>
import { useThemeStore } from '../stores/themeStore';

export default {
  name: 'FinanceCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      themeStore: useThemeStore(),
    }
  },
  computed: {
    isDark() {
      return this.themeStore.theme === 'dark';
    },
  },
};
</script>