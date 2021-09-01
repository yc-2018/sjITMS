import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany,loginOrg } from '@/utils/LoginContext';

//----- 板位管理方案-------------
export async function getByDcUuid(payload) {
  return request(`/iwms-facility/facility/palletBinScheme/queryByDcUuid?dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function getByCodeAndDcUuid(payload) {
  return request(`/iwms-facility/facility/palletBinScheme/${payload.code}/get?dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function save(payload){
  return request(`/iwms-facility/facility/palletBinScheme/save`, {
    method: 'POST',
    body:payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/palletBinScheme/modify`, {
    method: 'PUT',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/palletBinScheme/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/palletBinScheme/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/palletBinScheme/${payload.uuid}`, {
    method: 'GET',
  });
}
