<template>
  <div class="admin-login">
    <div class="admin-login-header">
      <div class="logo-circle">
        <van-icon name="setting-o" size="40" color="#1D1D1F" />
      </div>
      <h2>管理后台</h2>
    </div>
    <van-cell-group inset>
      <van-field v-model="password" type="password" label="口令" placeholder="请输入管理员口令" clearable />
    </van-cell-group>
    <div style="padding: 20px 16px 8px; max-width: 380px;">
      <van-button block type="primary" round size="large" @click="handleLogin" :loading="loading">
        登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../../api/customer.js';
import { showToast } from 'vant';

const router = useRouter();
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!password.value) {
    showToast('请输入口令');
    return;
  }
  loading.value = true;
  try {
    const res = await login(password.value);
    if (res.ok && res.role === 'admin') {
      sessionStorage.setItem('admin_auth', '1');
      router.push('/dashboard');
    } else {
      showToast('口令错误');
    }
  } catch (e) {
    showToast('登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #F5F5F7;
}
.admin-login-header {
  text-align: center;
  margin-bottom: 32px;
}
.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.admin-login-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1D1D1F;
}
</style>
