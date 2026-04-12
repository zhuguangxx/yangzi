import request from './request';

export function getDemand(phone) {
  return request.get(`/demands/${phone}`);
}

export function updateDemand(phone, demand) {
  return request.put(`/demands/${phone}`, { demand });
}
