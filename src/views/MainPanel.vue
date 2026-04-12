<template>
  <div class="main-panel">
    <van-nav-bar>
      <template #title>
        <span class="nav-title">扬子木门</span>
      </template>
      <template #right>
        <van-icon name="expand-o" size="20" @click="toggleFullscreen" />
      </template>
    </van-nav-bar>

    <van-notice-bar left-icon="contact" :scrollable="false" class="welcome-bar">
      欢迎，{{ customerStore.name || customerStore.phone }}
      <template v-if="customerStore.lastVisit">
        &nbsp;·&nbsp; 上次来访 {{ customerStore.lastVisit }}
      </template>
    </van-notice-bar>

    <van-tabs v-model:active="currentType" @change="switchType" shrink class="type-tabs">
      <van-tab title="案例库" name="案例库" />
      <van-tab title="选材库" name="选材库" />
    </van-tabs>

    <CategoryTabs v-model="currentCategory" @change="loadImages" />

    <div class="toolbar">
      <div class="size-switch">
        <van-icon name="photo-o" size="16" color="#AEAEB2" />
        <van-stepper v-model="thumbSize" :min="1" :max="4" @change="onSizeChange" />
        <van-icon name="photo-o" size="24" color="#1D1D1F" />
      </div>
    </div>

    <div class="image-grid" :class="'size-' + thumbSize" v-if="images.length">
      <ImageCard
        v-for="(img, idx) in images"
        :key="img.id"
        :image="img"
        :favorited="isFavorited(img.id)"
        :thumb-size="thumbSize"
        @click="previewImage(idx)"
        @fav-change="refreshFavStatus"
      />
    </div>
    <van-empty v-else description="暂无图片" image="search" />

    <ImageViewer
      v-model:show="showViewer"
      :images="images"
      :start-position="previewStart"
      :fav-ids="favIds"
      @fav-change="refreshFavStatus"
    />

    <BottomNav :active="0" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCustomerStore } from '../store/customer.js';
import { useAppStore } from '../store/app.js';
import { getImages } from '../api/image.js';
import { getFavorites } from '../api/favorite.js';
import CategoryTabs from '../components/CategoryTabs.vue';
import ImageCard from '../components/ImageCard.vue';
import ImageViewer from '../components/ImageViewer.vue';
import BottomNav from '../components/BottomNav.vue';

const customerStore = useCustomerStore();
const appStore = useAppStore();

const currentCategory = ref(appStore.currentCategory);
const currentType = ref(appStore.currentType);
const thumbSize = ref(appStore.thumbSize);
const images = ref([]);
const favIds = ref(new Set());
const showViewer = ref(false);
const previewStart = ref(0);

function onSizeChange(val) {
  appStore.setThumbSize(val);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function switchType(name) {
  currentType.value = name;
  appStore.setType(name);
  loadImages();
}

async function loadImages() {
  const res = await getImages({ category: currentCategory.value, type: currentType.value });
  if (res.ok) {
    images.value = res.images;
  }
}

async function loadFavorites() {
  if (!customerStore.phone) return;
  const res = await getFavorites(customerStore.phone);
  if (res.ok) {
    favIds.value = new Set(res.favorites.map(f => f.image_id));
  }
}

function isFavorited(id) {
  return favIds.value.has(id);
}

function previewImage(idx) {
  previewStart.value = idx;
  showViewer.value = true;
}

function refreshFavStatus() {
  loadFavorites();
}

onMounted(() => {
  loadImages();
  loadFavorites();
});
</script>

<style scoped>
.main-panel {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #F5F5F7;
}
.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: 1px;
}
.welcome-bar {
  background: rgba(255, 255, 255, 0.72);
}
.type-tabs {
  background: rgba(255, 255, 255, 0.72);
}
.toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px 4px;
}
.size-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}
.image-grid {
  display: grid;
  gap: 8px;
  padding: 8px 12px;
}
.image-grid.size-4 {
  grid-template-columns: repeat(4, 1fr);
}
.image-grid.size-3 {
  grid-template-columns: repeat(3, 1fr);
}
.image-grid.size-2 {
  grid-template-columns: repeat(2, 1fr);
}
.image-grid.size-1 {
  grid-template-columns: repeat(1, 1fr);
  max-width: 400px;
  margin: 0 auto;
}
</style>
