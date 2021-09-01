import request from '@/utils/request';
import {loginCompany} from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-basic/basic/vendor/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-basic/basic/vendor`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/vendor/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/vendor/${payload}?companyUuid=${companyUuid}`);
}

export async function getByCode(payload) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/vendor/getByCompanyUuidAndCode?code=${payload}&companyUuid=${companyUuid}`);
}

export async function enable(payload) {
  return request(`/iwms-basic/basic/vendor/${payload.uuid}/enable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function disable(payload) {
  return request(`/iwms-basic/basic/vendor/${payload.uuid}/disable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function batchImport(payload) {
  return request(`/iwms-basic/basic/vendor/batchimport?companyUuid=${loginCompany().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}

// export async function getImportTemplateUrl() {
//   return request(`/iwms-basic/basic/vendor/templet/download`);
// }
