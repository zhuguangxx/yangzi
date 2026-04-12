<template>
  <div class="customer-list">
    <van-nav-bar title="👥 客户管理" left-arrow @click-left="$router.push('/dashboard')" />
    <van-search v-model="keyword" placeholder="搜索姓名或手机号" @search="loadCustomers" />
    <van-pull-refresh v-model="refreshing" @refresh="loadCustomers">
      <van-cell-group v-if="filtered.length">
        <van-cell
          v-for="c in filtered"
          :key="c.phone"
          :title="c.name || c.phone"
          :label="c.phone + ' | ' + (c.address || '未填地址')"
          is-link
          @click="$router.push('/customers/' + c.phone)"
        />
      </van-cell-group>
      <van-empty v-else description="暂无客户" />
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCustomerList } from '../../api/customer.js';

const customers = ref([]);
const keyword = ref('');
const refreshing = ref(false);

const filtered = computed(() => {
  if (!keyword.value) return customers.value;
  const kw = keyword.value.toLowerCase();
  return customers.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(kw)) ||
    (c.phone && c.phone.includes(kw))
  );
});

async function loadCustomers() {
  refreshing.value = true;
  const res = await getCustomerList();
  if (res.ok) {
    customers.value = res.customers;
  }
  refreshing.value = false;
}

onMounted(() => {
  loadCustomers();
});
</script>

<style scoped>
.customer-list {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
