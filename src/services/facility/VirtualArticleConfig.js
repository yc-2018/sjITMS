import request from '@/utils/request';

export async function save(payload) {
  return request(`/iwms-facility/facility/virtualarticleconfig`, {
    method: 'POST',
    body: payload,
  });
}
export async function query(payload) {
  return request(`/iwms-facility/facility/virtualarticleconfig/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/virtualarticleconfig/remove?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/virtualarticleconfig/modify`, {
    method: 'POST',
    body: payload,
  });
}
export async function get(payload) {
  return request(`/iwms-facility/facility/virtualarticleconfig/get?uuid=${payload.uuid}`);
}
