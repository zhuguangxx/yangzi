import request from './request';

export function getImages(params) {
  return request.get('/images', { params });
}

export function uploadImages(formData) {
  return request.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function updateImage(id, data) {
  return request.put(`/images/${id}`, data);
}

export function deleteImage(id) {
  return request.delete(`/images/${id}`);
}
