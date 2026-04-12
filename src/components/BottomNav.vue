<template>
  <van-tabbar v-model="currentActive" @change="onChange" fixed>
    <van-tabbar-item icon="contact" to="/profile">资料</van-tabbar-item>
    <van-tabbar-item icon="like-o" :badge="count > 0 ? count : ''" to="/favorites">喜欢</van-tabbar-item>
    <van-tabbar-item icon="edit" to="/demand">需求</van-tabbar-item>
    <van-tabbar-item icon="revoke" @click="onLogout">登出</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store/app.js';
import { useCustomerStore } from '../store/customer.js';
import { showDialog, showToast } from 'vant';

const router = useRouter();
const appStore = useAppStore();
const customerStore = useCustomerStore();
const count = computed(() => appStore.favoriteCount);

const props = defineProps({
  active: { type: Number, default: 0 }
});

const currentActive = ref(props.active);
const emit = defineEmits(['change']);

function onChange(index) {
  currentActive.value = index;
  emit('change', index);
}

async function onLogout() {
  try {
    await showDialog({
      title: '切换用户',
      message: '确定登出当前账号？',
      showCancelButton: true,
      confirmButtonText: '登出',
      cancelButtonText: '取消'
    });
    customerStore.clear();
    appStore.setFavoriteCount(0);
    showToast('已登出');
    router.push('/');
  } catch (e) {}
}
</script>
