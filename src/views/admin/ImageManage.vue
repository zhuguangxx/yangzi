<template>
  <div class="image-manage">
    <van-nav-bar title="图片管理" left-arrow @click-left="$router.push('/dashboard')" />

    <van-cell-group inset title="上传图片" class="upload-section">
      <van-radio-group v-model="uploadCategory" direction="horizontal" class="radio-row">
        <van-radio name="木门">木门</van-radio>
        <van-radio name="玻璃门">玻璃门</van-radio>
        <van-radio name="窗户">窗户</van-radio>
      </van-radio-group>
      <van-radio-group v-model="uploadType" direction="horizontal" class="radio-row">
        <van-radio name="案例库">案例库</van-radio>
        <van-radio name="选材库">选材库</van-radio>
      </van-radio-group>
      <van-uploader
        v-model="fileList"
        multiple
        :max-count="20"
        :after-read="onUpload"
        accept="image/*"
      />
    </van-cell-group>

    <div class="filter-section">
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterCategory" :options="categoryOptions" @change="loadImages" />
        <van-dropdown-item v-model="filterType" :options="typeOptions" @change="loadImages" />
      </van-dropdown-menu>
    </div>

    <div class="image-grid" v-if="images.length">
      <div class="img-item" v-for="img in images" :key="img.id">
        <img :src="img.url" class="img-thumb" loading="lazy" />
        <div class="img-info">
          <span>{{ img.category }} | {{ img.type }}</span>
        </div>
        <div class="img-actions">
          <van-button size="mini" plain round @click="editImage(img)">修改</van-button>
          <van-button size="mini" plain round type="danger" @click="onDelete(img)">删除</van-button>
        </div>
      </div>
    </div>
    <van-empty v-else description="暂无图片" image="search" />

    <van-dialog v-model:show="showEdit" title="修改分类" show-cancel-button @confirm="onSaveEdit">
      <div style="padding: 16px;">
        <van-radio-group v-model="editCategory" direction="horizontal" class="radio-row">
          <van-radio name="木门">木门</van-radio>
          <van-radio name="玻璃门">玻璃门</van-radio>
          <van-radio name="窗户">窗户</van-radio>
        </van-radio-group>
        <van-radio-group v-model="editType" direction="horizontal" class="radio-row" style="margin-top: 12px;">
          <van-radio name="案例库">案例库</van-radio>
          <van-radio name="选材库">选材库</van-radio>
        </van-radio-group>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getImages, uploadImages, updateImage, deleteImage } from '../../api/image.js';
import { showToast, showDialog } from 'vant';

const uploadCategory = ref('木门');
const uploadType = ref('案例库');
const fileList = ref([]);
const filterCategory = ref('');
const filterType = ref('');
const images = ref([]);
const showEdit = ref(false);
const editId = ref(null);
const editCategory = ref('木门');
const editType = ref('案例库');

const categoryOptions = [
  { text: '全部分类', value: '' },
  { text: '木门', value: '木门' },
  { text: '玻璃门', value: '玻璃门' },
  { text: '窗户', value: '窗户' }
];

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '案例库', value: '案例库' },
  { text: '选材库', value: '选材库' }
];

async function loadImages() {
  const params = {};
  if (filterCategory.value) params.category = filterCategory.value;
  if (filterType.value) params.type = filterType.value;
  const res = await getImages(params);
  if (res.ok) {
    images.value = res.images;
  }
}

async function onUpload() {
  const files = fileList.value.filter(f => f.file).map(f => f.file);
  if (!files.length) return;

  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  formData.append('category', uploadCategory.value);
  formData.append('type', uploadType.value);

  const res = await uploadImages(formData);
  if (res.ok) {
    showToast(`上传成功 ${res.images.length} 张`);
    fileList.value = [];
    loadImages();
  } else {
    showToast(res.msg || '上传失败');
  }
}

function editImage(img) {
  editId.value = img.id;
  editCategory.value = img.category;
  editType.value = img.type;
  showEdit.value = true;
}

async function onSaveEdit() {
  const res = await updateImage(editId.value, {
    category: editCategory.value,
    type: editType.value
  });
  if (res.ok) {
    showToast('修改成功');
    loadImages();
  }
}

async function onDelete(img) {
  try {
    await showDialog({ title: '确认', message: '确定删除该图片？' });
    const res = await deleteImage(img.id);
    if (res.ok) {
      showToast('已删除');
      loadImages();
    }
  } catch (e) {}
}

onMounted(() => {
  loadImages();
});
</script>

<style scoped>
.image-manage {
  min-height: 100vh;
  background: #F5F5F7;
  padding-bottom: 24px;
}
.upload-section {
  margin-bottom: 12px;
}
.radio-row {
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
}
.filter-section {
  margin-bottom: 12px;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
}
.img-item {
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.img-thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
.img-info {
  padding: 4px 8px;
  font-size: 11px;
  color: #6E6E73;
}
.img-actions {
  display: flex;
  gap: 4px;
  padding: 4px 8px 8px;
}
</style>
