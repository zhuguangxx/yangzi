<template>
  <div class="favorites-page">
    <van-nav-bar title="我的喜欢" left-arrow @click-left="$router.push('/main')" />
    <div class="fav-grid" v-if="favorites.length">
      <div class="fav-item" v-for="fav in favorites" :key="fav.id">
        <img :src="fav.url" class="fav-img" loading="lazy" @click="preview(fav)" />
        <div class="fav-remove" @click="removeFav(fav)">
          <van-icon name="delete-o" size="18" color="#FFFFFF" />
        </div>
      </div>
    </div>
    <van-empty v-else description="还没有收藏哦" image="like" />
    <BottomNav :active="1" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../store/customer.js';
import { useAppStore } from '../store/app.js';
import { getFavorites, removeFavorite } from '../api/favorite.js';
import { showImagePreview, showToast } from 'vant';
import BottomNav from '../components/BottomNav.vue';

const router = useRouter();
const customerStore = useCustomerStore();
const appStore = useAppStore();
const favorites = ref([]);

async function loadFavorites() {
  if (!customerStore.phone) return;
  const res = await getFavorites(customerStore.phone);
  if (res.ok) {
    favorites.value = res.favorites;
    appStore.setFavoriteCount(res.favorites.length);
  }
}

function preview(fav) {
  showImagePreview({ images: [fav.url] });
}

async function removeFav(fav) {
  try {
    await removeFavorite(customerStore.phone, fav.image_id);
    showToast('已移除');
    loadFavorites();
  } catch (e) {
    showToast('操作失败');
  }
}

onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #F5F5F7;
}
.fav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 12px 14px;
}
.fav-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  background: #E5E5EA;
}
.fav-img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  display: block;
}
.fav-remove {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
