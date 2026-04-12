<template>
  <van-popup v-model:show="visible" position="center" :style="{ width: '100%', height: '100%' }" :overlay="false" class="viewer-popup">
    <div class="viewer" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="viewer-header">
        <van-icon name="arrow-left" size="22" color="#fff" @click="close" />
        <span class="viewer-counter">{{ currentIndex + 1 }} / {{ imageList.length }}</span>
        <van-icon name="like" :color="isCurrentFav ? '#FF3B30' : '#fff'" size="24" @click="toggleFav" />
      </div>

      <div class="viewer-body">
        <div class="swipe-container" :style="{ transform: `translateX(${-currentIndex * 100}%)`, transition: animating ? 'transform 0.3s ease' : 'none' }">
          <div class="swipe-item" v-for="(img, idx) in imageList" :key="idx">
            <img :src="img.url" class="viewer-img" @click="onImgClick" />
          </div>
        </div>
      </div>

      <div class="viewer-footer" v-if="currentImage">
        <span class="viewer-category">{{ currentImage.category }} · {{ currentImage.type }}</span>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { addFavorite, removeFavorite } from '../api/favorite.js';
import { useCustomerStore } from '../store/customer.js';
import { useAppStore } from '../store/app.js';
import { showToast } from 'vant';

const props = defineProps({
  show: { type: Boolean, default: false },
  images: { type: Array, default: () => [] },
  startPosition: { type: Number, default: 0 },
  favIds: { type: Set, default: () => new Set() }
});

const emit = defineEmits(['close', 'update:show', 'fav-change']);
const customerStore = useCustomerStore();
const appStore = useAppStore();

const visible = ref(props.show);
const currentIndex = ref(props.startPosition);
const animating = ref(false);
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchDeltaX = ref(0);
const showBars = ref(true);

const imageList = computed(() => props.images);
const currentImage = computed(() => imageList.value[currentIndex.value]);
const isCurrentFav = computed(() => {
  if (!currentImage.value) return false;
  return props.favIds.has(currentImage.value.id);
});

watch(() => props.show, (val) => {
  visible.value = val;
  if (val) {
    currentIndex.value = props.startPosition;
  }
});

watch(visible, (val) => {
  emit('update:show', val);
});

watch(() => props.startPosition, (val) => {
  currentIndex.value = val;
});

function close() {
  visible.value = false;
}

function onImgClick() {
  showBars.value = !showBars.value;
}

function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  touchDeltaX.value = 0;
  animating.value = false;
}

function onTouchMove(e) {
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value;
}

function onTouchEnd() {
  const threshold = 60;
  if (Math.abs(touchDeltaX.value) > threshold) {
    animating.value = true;
    if (touchDeltaX.value < 0 && currentIndex.value < imageList.value.length - 1) {
      currentIndex.value++;
    } else if (touchDeltaX.value > 0 && currentIndex.value > 0) {
      currentIndex.value--;
    }
  }
  touchDeltaX.value = 0;
}

async function toggleFav() {
  if (!customerStore.phone) {
    showToast('请先登录');
    return;
  }
  if (!currentImage.value) return;
  try {
    if (isCurrentFav.value) {
      await removeFavorite(customerStore.phone, currentImage.value.id);
      appStore.setFavoriteCount(Math.max(0, appStore.favoriteCount - 1));
      showToast('已取消收藏');
    } else {
      await addFavorite(customerStore.phone, currentImage.value.id);
      appStore.setFavoriteCount(appStore.favoriteCount + 1);
      showToast('已收藏');
    }
    emit('fav-change');
  } catch (e) {
    showToast('操作失败');
  }
}
</script>

<style scoped>
.viewer-popup {
  background: #000;
}
.viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
  flex-shrink: 0;
}
.viewer-counter {
  color: #fff;
  font-size: 15px;
  font-weight: 500;
}
.viewer-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}
.swipe-container {
  display: flex;
  height: 100%;
  will-change: transform;
}
.swipe-item {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.viewer-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  user-select: none;
  -webkit-user-drag: none;
}
.viewer-footer {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
  flex-shrink: 0;
  text-align: center;
}
.viewer-category {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}
</style>
