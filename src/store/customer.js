import { defineStore } from 'pinia';
import { ref } from 'vue';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('door_customer');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem('door_customer', JSON.stringify(data));
  } catch (e) {}
}

const saved = loadFromStorage();

export const useCustomerStore = defineStore('customer', () => {
  const phone = ref(saved?.phone || '');
  const name = ref(saved?.name || '');
  const address = ref(saved?.address || '');
  const area = ref(saved?.area || '');
  const house_type = ref(saved?.house_type || '');
  const renovation_type = ref(saved?.renovation_type || '');
  const demand = ref(saved?.demand || '');
  const lastVisit = ref(saved?.lastVisit || '');

  function setCustomer(data) {
    phone.value = data.phone || '';
    name.value = data.name || '';
    address.value = data.address || '';
    area.value = data.area || '';
    house_type.value = data.house_type || '';
    renovation_type.value = data.renovation_type || '';
    demand.value = data.demand || '';
    persist();
  }

  function setLastVisit(val) {
    lastVisit.value = val || '';
    persist();
  }

  function clear() {
    phone.value = '';
    name.value = '';
    address.value = '';
    area.value = '';
    house_type.value = '';
    renovation_type.value = '';
    demand.value = '';
    lastVisit.value = '';
    localStorage.removeItem('door_customer');
  }

  function persist() {
    saveToStorage({
      phone: phone.value,
      name: name.value,
      address: address.value,
      area: area.value,
      house_type: house_type.value,
      renovation_type: renovation_type.value,
      demand: demand.value,
      lastVisit: lastVisit.value
    });
  }

  return {
    phone, name, address, area, house_type, renovation_type, demand, lastVisit,
    setCustomer, setLastVisit, clear
  };
});
