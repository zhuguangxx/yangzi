<template>
  <div class="dashboard">
    <van-nav-bar title="仪表盘" />

    <van-grid :column-num="3" :gutter="10" class="stats-grid">
      <van-grid-item>
        <template #text>
          <div class="stat-num">{{ customerCount }}</div>
          <div class="stat-label">客户总数</div>
        </template>
      </van-grid-item>
      <van-grid-item>
        <template #text>
          <div class="stat-num">{{ todayVisits }}</div>
          <div class="stat-label">今日拜访</div>
        </template>
      </van-grid-item>
      <van-grid-item>
        <template #text>
          <div class="stat-num">{{ imageCount }}</div>
          <div class="stat-label">图片总数</div>
        </template>
      </van-grid-item>
    </van-grid>

    <van-cell-group inset title="热门收藏" class="section">
      <van-cell v-for="item in hotList" :key="item.id" :title="item.category + ' - ' + item.type" :value="item.fav_count + ' 次收藏'" />
      <van-empty v-if="!hotList.length" description="暂无收藏数据" :image-size="60" />
    </van-cell-group>

    <van-grid :column-num="2" :gutter="10" class="nav-grid">
      <van-grid-item icon="friends-o" text="客户管理" to="/customers" />
      <van-grid-item icon="photo-o" text="图片管理" to="/images" />
    </van-grid>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCustomerList } from '../../api/customer.js';
import { getImages } from '../../api/image.js';
import { getHotFavorites } from '../../api/favorite.js';

const customerCount = ref(0);
const todayVisits = ref(0);
const imageCount = ref(0);
const hotList = ref([]);

onMounted(async () => {
  const custRes = await getCustomerList();
  if (custRes.ok) {
    customerCount.value = custRes.customers.length;
  }
  const imgRes = await getImages();
  if (imgRes.ok) {
    imageCount.value = imgRes.images.length;
  }
  const hotRes = await getHotFavorites();
  if (hotRes.ok) {
    hotList.value = hotRes.stats;
  }
  try {
    const today = new Date().toISOString().slice(0, 10);
    let count = 0;
    for (const c of custRes.customers) {
      if (c.created_at && c.created_at.startsWith(today)) count++;
    }
    todayVisits.value = count;
  } catch (e) {}
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #F5F5F7;
  padding-bottom: 24px;
}
.stats-grid {
  padding: 16px;
}
.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: #1D1D1F;
  text-align: center;
}
.stat-label {
  font-size: 12px;
  color: #6E6E73;
  margin-top: 4px;
  text-align: center;
}
.section {
  margin: 0 0 16px;
}
.nav-grid {
  padding: 0 16px;
}
</style>
