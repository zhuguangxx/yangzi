<template>
  <div class="profile-page">
    <van-nav-bar title="个人资料" left-arrow @click-left="$router.push('/main')" />
    <van-form @submit="onSave" class="profile-form glass-card">
      <van-cell-group inset>
        <van-field v-model="form.name" label="姓名" placeholder="请输入姓名" clearable />
        <van-field v-model="form.phone" label="手机号" readonly />
        <van-field v-model="form.address" label="地址" placeholder="请输入地址" clearable />
        <van-field v-model="form.area" label="面积" placeholder="请输入面积" clearable />
        <van-field v-model="form.house_type" label="户型" placeholder="请输入户型" clearable />
        <van-field v-model="form.renovation_type" label="装修类型" placeholder="新装/翻新" clearable />
      </van-cell-group>
      <div style="padding: 20px 16px 8px;">
        <van-button block type="primary" round size="large" native-type="submit" :loading="loading">
          保存
        </van-button>
      </div>
    </van-form>
    <BottomNav :active="0" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../store/customer.js';
import { updateCustomer } from '../api/customer.js';
import { showToast } from 'vant';
import BottomNav from '../components/BottomNav.vue';

const router = useRouter();
const customerStore = useCustomerStore();
const loading = ref(false);

const form = reactive({
  name: '',
  phone: '',
  address: '',
  area: '',
  house_type: '',
  renovation_type: ''
});

onMounted(() => {
  form.name = customerStore.name;
  form.phone = customerStore.phone;
  form.address = customerStore.address;
  form.area = customerStore.area;
  form.house_type = customerStore.house_type;
  form.renovation_type = customerStore.renovation_type;
});

async function onSave() {
  loading.value = true;
  try {
    const res = await updateCustomer(form.phone, {
      name: form.name,
      address: form.address,
      area: form.area,
      house_type: form.house_type,
      renovation_type: form.renovation_type
    });
    if (res.ok) {
      customerStore.setCustomer(res.customer);
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
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #F5F5F7;
}
.profile-form {
  margin: 16px;
  padding: 8px 0 16px;
}
</style>
