import {stringify} from 'qs';
import request from '@/utils/request';
import {loginCompany} from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/pickarea`, {
    method: 'POST',
    body: payload,
  });
}

export async function deletePickArea(payload) {
  return request(`/iwms-facility/facility/pickarea/${payload.uuid}?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/pickarea/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/pickarea/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(uuid) {
  return request(`/iwms-facility/facility/pickarea/${uuid}`);
}

export async function getByCodeAndDCUuid(payload) {
  const code = payload.code;
  const dcUuid = payload.dcUuid;
  return request(`/iwms-facility/facility/pickarea/ByCode?code=${code}&dcUuid=${dcUuid}`);
}