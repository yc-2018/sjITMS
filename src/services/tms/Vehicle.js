import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-basic/basic/vehicle`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/vehicle/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByUuid(payload) {
  return request(`/iwms-basic/basic/vehicle/${payload}`);
}

export async function getByCode(payload) {
  return request(`/iwms-basic/basic/vehicle/getByCodeAndCompanyUuid?code=${payload}&companyUuid=${loginCompany().uuid}`,{
    method: 'POST',
  });
}

export async function deleteEntity(payload) {
  return request(`/iwms-basic/basic/vehicle?${stringify(payload)}`, {
    method: 'DELETE',
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/vehicle/page?companyUuid=${loginCompany().uuid}`, {
    method: 'POST',
    body: payload
  });
}

export async function online(payload) {
  return request(`/iwms-basic/basic/vehicle/online?${stringify(payload)}`, {
    method: 'POST',
  });
}

export async function offline(payload) {
  return request(`/iwms-basic/basic/vehicle/offline?${stringify(payload)}`, {
    method: 'POST',
  });
}

export async function free(payload) {
  return request(`/iwms-basic/basic/vehicle/free?${stringify(payload)}`, {
    method: 'POST',
  });
}

export async function saveEmp(payload) {
  let param = [];
  param.push(payload);
  return request(`/iwms-basic/basic/vehicle/emp`, {
    method: 'POST',
    body: param,
  });
}

export async function removeEmp(payload) {
  return request(`/iwms-basic/basic/vehicle/emp?vehicleUuid=${payload.vehicleUuid}`, {
    method: 'DELETE',
    body: payload.params,
  });
}

export async function getByDispatchCenterUuid(payload) {
  return request(`/iwms-basic/basic/vehicle/getByDispatchCenterUuid?dispatchCenterUuid=${loginOrg().uuid}`);
}
