<template>
  <div class="demand-page">
    <van-nav-bar title="我的需求" left-arrow @click-left="$router.push('/main')" />
    <div class="demand-content glass-card">
      <van-cell-group inset>
        <van-field
          v-model="demand"
          type="textarea"
          placeholder="请输入您的需求，如风格偏好、预算范围、特殊要求等..."
          rows="8"
          autosize
          maxlength="1000"
          show-word-limit
        />
      </van-cell-group>
      <div style="padding: 20px 16px 8px;">
        <van-button block type="primary" round size="large" @click="onSave" :loading="loading">
          保存需求
        </van-button>
      </div>
    </div>
    <BottomNav :active="2" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../store/customer.js';
import { getDemand, updateDemand } from '../api/demand.js';
import { showToast } from 'vant';
import BottomNav from '../components/BottomNav.vue';

const router = useRouter();
const customerStore = useCustomerStore();
const demand = ref('');
const loading = ref(false);

async function loadDemand() {
  if (!customerStore.phone) return;
  const res = await getDemand(customerStore.phone);
  if (res.ok) {
    demand.value = res.demand;
  }
}

async function onSave() {
  loading.value = true;
  try {
    const res = await updateDemand(customerStore.phone, demand.value);
    if (res.ok) {
      customerStore.demand = demand.value;
      showToast('保存成功');
    } else {
      showToast(res.msg);
    }
  } catch (e) {
    showToast('保存失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadDemand();
});
</script>

<style scoped>
.demand-page {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #F5F5F7;
}
.demand-content {
  margin: 16px;
  padding: 8px 0 16px;
}
</style>
