import request from './request';

export function addFavorite(customer_phone, image_id) {
  return request.post('/favorites', { customer_phone, image_id });
}

export function removeFavorite(customer_phone, image_id) {
  return request.delete('/favorites', { data: { customer_phone, image_id } });
}

export function getFavorites(phone) {
  return request.get(`/favorites/${phone}`);
}

export function getFavoriteCount(phone) {
  return request.get(`/favorites/count/${phone}`);
}

export function getHotFavorites() {
  return request.get('/favorites/stats/hot');
}
