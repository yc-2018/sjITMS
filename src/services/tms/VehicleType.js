import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-basic/basic/vehicletype`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/vehicletype/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByUuid(payload) {
  return request(`/iwms-basic/basic/vehicletype/${payload}`);
}

export async function getByCodeAndCompanyUuid(payload) {
  return request(`/iwms-basic/basic/vehicletype/getByCodeAndCompanyUuid?companyUuid=${loginCompany().uuid}&code=${payload}`,{
    method: 'POST',
  })
}

export async function deleteEntity(payload) {
  return request(`/iwms-basic/basic/vehicletype?${stringify(payload)}`, {
    method: 'DELETE',
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/vehicletype/page?companyUuid=${loginCompany().uuid}`, {
    method: 'POST',
    body: payload
  });
}

export async function getByCompanyUuid(payload) {
  return request(`/iwms-basic/basic/vehicletype/bycompanyuuid?${stringify(payload)}`);
}
