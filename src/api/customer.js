import request from './request';

export function login(phone) {
  return request.post('/auth/login', { phone });
}

export function registerCustomer(data) {
  return request.post('/customers', data);
}

export function getCustomer(phone) {
  return request.get(`/customers/${phone}`);
}

export function updateCustomer(phone, data) {
  return request.put(`/customers/${phone}`, data);
}

export function getCustomerList() {
  return request.get('/customers');
}

export function deleteCustomer(phone) {
  return request.delete(`/customers/${phone}`);
}

export function getVisits(phone) {
  return request.get(`/customers/${phone}/visits`);
}
