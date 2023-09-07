import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-basic/basic/dc/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-basic/basic/dc`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/dc/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function enable(payload) {
  return request(`/iwms-basic/basic/dc/${payload.uuid}/enable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function disable(payload) {
  return request(`/iwms-basic/basic/dc/${payload.uuid}/disable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function get(payload) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/dc/uuidAndCompanyUuid?companyUuid=${companyUuid}&uuid=${payload.uuid}`);
}

export async function getByCompanyUuid() {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/dc/list/company?companyUuid=${companyUuid}`);
}

export async function getByCodeAndCompanyUuid(payload) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/dc/codeAndCompanyUuid?code=${payload.entityCode}&companyUuid=${companyUuid}`);
}
