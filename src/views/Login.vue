<template>
  <div class="login-page">
    <div class="login-header">
      <img src="/yzlogo.png" alt="扬子木门" class="logo-img" />
    </div>
    <div class="login-form glass-card">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          maxlength="11"
          clearable
        />
      </van-cell-group>
      <div style="padding: 20px 16px 8px;">
        <van-button type="primary" block round size="large" @click="handleLogin" :loading="loading">
          进入展厅
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../api/customer.js';
import { useCustomerStore } from '../store/customer.js';
import { useAppStore } from '../store/app.js';
import { showToast } from 'vant';

const router = useRouter();
const customerStore = useCustomerStore();
const appStore = useAppStore();
const phone = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!phone.value) {
    showToast('请输入手机号');
    return;
  }
  loading.value = true;
  try {
    const res = await login(phone.value);
    if (!res.ok) {
      showToast(res.msg);
      return;
    }
    if (res.role === 'admin') {
      window.location.href = '/admin';
      return;
    }
    if (res.isNew) {
      customerStore.phone = phone.value;
      router.push('/register');
    } else {
      customerStore.setCustomer(res.customer);
      customerStore.setLastVisit(res.lastVisit);
      const { getFavoriteCount } = await import('../api/favorite.js');
      const favRes = await getFavoriteCount(phone.value);
      if (favRes.ok) {
        appStore.setFavoriteCount(favRes.count);
      }
      router.push('/main');
    }
  } catch (e) {
    showToast('登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #F5F5F7;
}
.login-header {
  text-align: center;
  margin-bottom: 40px;
}
.logo-img {
  width: 320px;
  max-width: 80vw;
  height: auto;
  margin: 0 auto;
  display: block;
}
.login-form {
  width: 100%;
  max-width: 380px;
  padding: 8px 0 16px;
}
</style>
