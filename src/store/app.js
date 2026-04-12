import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const currentCategory = ref('木门');
  const currentType = ref('案例库');
  const favoriteCount = ref(0);
  const thumbSize = ref(2);

  function setCategory(val) {
    currentCategory.value = val;
  }

  function setType(val) {
    currentType.value = val;
  }

  function setFavoriteCount(val) {
    favoriteCount.value = val;
  }

  function setThumbSize(val) {
    thumbSize.value = val;
  }

  return {
    currentCategory, currentType, favoriteCount, thumbSize,
    setCategory, setType, setFavoriteCount, setThumbSize
  };
});
