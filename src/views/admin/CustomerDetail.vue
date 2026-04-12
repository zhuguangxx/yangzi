<template>
  <div class="customer-detail">
    <van-nav-bar title="客户详情" left-arrow @click-left="$router.back()" />
    <van-form @submit="onSave" class="detail-form glass-card">
      <van-cell-group inset>
        <van-field v-model="form.name" label="姓名" clearable />
        <van-field v-model="form.phone" label="手机号" readonly />
        <van-field v-model="form.address" label="地址" clearable />
        <van-field v-model="form.area" label="面积" clearable />
        <van-field v-model="form.house_type" label="户型" clearable />
        <van-field v-model="form.renovation_type" label="装修类型" clearable />
        <van-field v-model="form.demand" label="需求备注" type="textarea" rows="3" autosize />
      </van-cell-group>
      <div style="padding: 16px; display: flex; gap: 12px;">
        <van-button type="primary" round native-type="submit" :loading="loading">保存</van-button>
        <van-button plain round type="danger" @click="onDelete">删除客户</van-button>
      </div>
    </van-form>

    <van-cell-group inset title="拜访记录" class="section">
      <van-cell v-for="v in visits" :key="v.id" :title="v.visit_time" />
      <van-empty v-if="!visits.length" description="暂无记录" :image-size="60" />
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCustomer, updateCustomer, deleteCustomer, getVisits } from '../../api/customer.js';
import { showToast, showDialog } from 'vant';

const route = useRoute();
const router = useRouter();
const phone = route.params.phone;
const loading = ref(false);
const visits = ref([]);

const form = reactive({
  name: '',
  phone: '',
  address: '',
  area: '',
  house_type: '',
  renovation_type: '',
  demand: ''
});

async function loadDetail() {
  const res = await getCustomer(phone);
  if (res.ok) {
    Object.assign(form, res.customer);
  }
  const vRes = await getVisits(phone);
  if (vRes.ok) {
    visits.value = vRes.visits;
  }
}

async function onSave() {
  loading.value = true;
  try {
    const res = await updateCustomer(phone, {
      name: form.name,
      address: form.address,
      area: form.area,
      house_type: form.house_type,
      renovation_type: form.renovation_type,
      demand: form.demand
    });
    if (res.ok) {
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

async function onDelete() {
  try {
    await showDialog({ title: '确认', message: '确定删除该客户？' });
    const res = await deleteCustomer(phone);
    if (res.ok) {
      showToast('已删除');
      router.back();
    }
  } catch (e) {}
}

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.customer-detail {
  min-height: 100vh;
  background: #F5F5F7;
}
.detail-form {
  margin: 16px;
  padding: 8px 0 16px;
}
.section {
  margin: 0 0 12px;
}
</style>
