import request from '@/utils/request';

export async function save(payload) {
  return request(`/iwms-facility/facility/storeAllocateBinConfig`, {
    method: 'POST',
    body: payload
  });
}
export async function modify(payload) {
  return request(`/iwms-facility/facility/storeAllocateBinConfig/modify`, {
    method: 'POST',
    body: payload
  });
}
export async function query(payload) {
  return request(`/iwms-facility/facility/storeAllocateBinConfig/page`, {
    method: 'POST',
    body: payload
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/storeAllocateBinConfig/remove?dcUuid=${payload.dcUuid}&storeUuid=${payload.storeUuid}&version=${payload.version}`, {
    method: 'POST',
  });
}

export async function getConfigByStoreUuidAndDcUuid(payload) {
  return request(`/iwms-facility/facility/storeAllocateBinConfig/getConfigByStoreUuidAndDcUuid?dcUuid=${payload.dcUuid}&storeUuid=${payload.storeUuid}`);
}
