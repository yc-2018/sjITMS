import { stringify } from 'qs';
import request from '@/utils/request';
import { async } from 'q';
import {loginCompany} from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-basic/basic/category/save`,{
    method: 'POST',
    body: payload,
  });
}

export async function deleteCategory(payload) {
  return request(`/iwms-basic/basic/category/${payload.uuid}?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/category/modify`,{
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/category/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function online(payload) {
  return request(`/iwms-basic/basic/category/${payload.uuid}/online?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function offline(payload) {
  return request(`/iwms-basic/basic/category/${payload.uuid}/offline?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function get(uuid) {
  return request(`/iwms-basic/basic/category/${uuid}`);
}

export async function getByCode(code) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/category/getbycode?code=${code}&companyUuid=${companyUuid}`);
}

export async function batchImport(payload) {
  return request(`/iwms-basic/basic/category/batchimport?companyUuid=${loginCompany().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}

// export async function getImportTemplateUrl() {
//   return request(`/iwms-basic/basic/category/templet/download`);
// }

export async function getByCompanyUuid() {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/category/getByCompanyUuid?companyUuid=${companyUuid}`);
}
