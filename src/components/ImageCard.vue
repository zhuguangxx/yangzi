<template>
  <div class="image-card" @click="$emit('click', image)">
    <img :src="image.url" class="card-img" :style="imgStyle" loading="lazy" />
    <div class="fav-btn" @click.stop="toggleFavorite">
      <van-icon :name="isFav ? 'like' : 'like-o'" :color="isFav ? '#FF3B30' : '#FFFFFF'" size="20" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { addFavorite, removeFavorite } from '../api/favorite.js';
import { useCustomerStore } from '../store/customer.js';
import { useAppStore } from '../store/app.js';
import { showToast } from 'vant';

const props = defineProps({
  image: { type: Object, required: true },
  favorited: { type: Boolean, default: false },
  thumbSize: { type: Number, default: 2 }
});

const emit = defineEmits(['click', 'fav-change']);
const customerStore = useCustomerStore();
const appStore = useAppStore();
const isFav = ref(props.favorited);

const imgStyle = computed(() => {
  const ratios = { 1: '4/5', 2: '3/4', 3: '1/1', 4: '1/1' };
  return { aspectRatio: ratios[props.thumbSize] || '3/4' };
});

watch(() => props.favorited, (val) => {
  isFav.value = val;
});

async function toggleFavorite() {
  if (!customerStore.phone) {
    showToast('请先登录');
    return;
  }
  try {
    if (isFav.value) {
      await removeFavorite(customerStore.phone, props.image.id);
      isFav.value = false;
      appStore.setFavoriteCount(Math.max(0, appStore.favoriteCount - 1));
      showToast('已取消收藏');
    } else {
      await addFavorite(customerStore.phone, props.image.id);
      isFav.value = true;
      appStore.setFavoriteCount(appStore.favoriteCount + 1);
      showToast('已收藏');
    }
    emit('fav-change', isFav.value);
  } catch (e) {
    showToast('操作失败');
  }
}
</script>

<style scoped>
.image-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: #E5E5EA;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.card-img {
  width: 100%;
  object-fit: cover;
  display: block;
}
.fav-btn {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
