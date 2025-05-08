<template>
  <div class="flex flex-col items-center justify-center bg-gray-100 border border-gray-300 font-sans rounded-lg p-5 shadow w-full h-40 text-center text-gray-800 break-words">
    <h3 class="font-semibold text-lg leading-tight">{{ title }}</h3>
    <div v-if="value !== null" class="mt-2 text-xl leading-snug truncate">{{ value }}</div>
    <div v-if="$slots.default" class="mt-4 text-left w-full text-sm">
      <slot />
    </div>
  </div>
</template>

<script>
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
};
</script>