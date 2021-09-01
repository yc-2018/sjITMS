import request from '@/utils/request';

export async function save(payload) {
  return request(`/iwms-facility/facility/packageconfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/packageconfig/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/packageconfig/get?dcUuid=${payload.dcUuid}`);
}
