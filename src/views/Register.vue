<template>
  <div class="register-page">
    <van-nav-bar title="新客户登记" />
    <van-form @submit="onSubmit" class="register-form glass-card">
      <van-cell-group inset>
        <van-field v-model="form.name" label="姓名" placeholder="选填" clearable />
        <van-field v-model="form.address" label="地址" placeholder="选填" clearable />
        <van-field v-model="form.area" label="面积" placeholder="选填" clearable />
        <van-field v-model="form.house_type" label="户型" placeholder="选填" clearable />
        <van-field v-model="form.renovation_type" label="装修类型" placeholder="选填" clearable />
      </van-cell-group>
      <div class="btn-group">
        <van-button block type="primary" round size="large" native-type="submit" :loading="loading">
          提交
        </van-button>
        <van-button block plain round size="large" @click="skipRegister">
          跳过，稍后补充
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { registerCustomer } from '../api/customer.js';
import { useCustomerStore } from '../store/customer.js';
import { showToast } from 'vant';

const router = useRouter();
const customerStore = useCustomerStore();
const loading = ref(false);

const form = reactive({
  name: '',
  address: '',
  area: '',
  house_type: '',
  renovation_type: ''
});

async function onSubmit() {
  loading.value = true;
  try {
    const res = await registerCustomer({
      phone: customerStore.phone,
      ...form
    });
    if (res.ok) {
      customerStore.setCustomer(res.customer);
      showToast('登记成功');
      router.push('/main');
    } else {
      showToast(res.msg);
    }
  } catch (e) {
    showToast('登记失败');
  } finally {
    loading.value = false;
  }
}

function skipRegister() {
  onSubmit();
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #F5F5F7;
}
.register-form {
  margin: 16px;
  padding: 8px 0 16px;
}
.btn-group {
  margin-top: 20px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
