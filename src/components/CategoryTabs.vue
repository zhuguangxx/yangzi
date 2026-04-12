<template>
  <div class="category-tabs">
    <van-tabs v-model:active="activeTab" @change="onChange" shrink>
      <van-tab title="木门" name="木门" />
      <van-tab title="玻璃门" name="玻璃门" />
      <van-tab title="窗户" name="窗户" />
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '木门' }
});

const emit = defineEmits(['update:modelValue', 'change']);
const activeTab = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  activeTab.value = val;
});

function onChange(name) {
  emit('update:modelValue', name);
  emit('change', name);
}
</script>

<style scoped>
.category-tabs {
  background: #fff;
}
</style>
