import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-facility/facility/categoryStorageConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/categoryStorageConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/categoryStorageConfig/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/categoryStorageConfig/delete?uuid=${payload.uuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(uuid) {
  return request(`/iwms-facility/facility/receiveConfig/${uuid}`);
}

export async function getByCategoryUuidAndDcUuid(payload) {
  return request(`/iwms-facility/facility/categoryStorageConfig/getByCategoryUuidAndDcUuid?categoryUuid=${payload.categoryUuid}&dcUuid=${payload.dcUuid}`);
}
