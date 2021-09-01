import request from '@/utils/request';

export async function batchSave(payload) {
  return request(`/iwms-facility/facility/allowVendorRtnConfig`, {
    method: 'POST',
    body: payload,
  });
}
export async function query(payload) {
  return request(`/iwms-facility/facility/allowVendorRtnConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function batchRemove(payload) {
  return request(`/iwms-facility/facility/allowVendorRtnConfig/delete`, {
    method: 'DELETE',
    body: payload
  });
}

export async function allowAll(payload) {
  return request(`/iwms-facility/facility/allowVendorRtnConfig/allowAll?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`, {
    method: 'POST',
  });
}

export async function forbidAll(payload) {
  return request(`/iwms-facility/facility/allowVendorRtnConfig/forbidAll?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`, {
    method: 'POST',
  });
}
