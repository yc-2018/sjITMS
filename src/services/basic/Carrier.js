import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser,loginCompany } from '@/utils/LoginContext';
export async function query(params) {
  return request(`/iwms-basic/basic/carrier/page`, {
    method: 'POST',
    body: params,
  });
}

export async function add(params) {
  return request(`/iwms-basic/basic/carrier`, {
    method: 'POST',
    body: params,
  });
}

export async function update(params) {
  return request(`/iwms-basic/basic/carrier/modify`, {
    method: 'POST',
    body: params,
  });
}

export async function online(params) {
  const uuid = params.uuid;
  return request(`/iwms-basic/basic/carrier/${uuid}/online?companyUuid=${loginCompany().uuid}`, {
    method: 'POST'
  });
}

export async function offline(params) {
  const uuid = params.uuid;
  return request(`/iwms-basic/basic/carrier/${uuid}/offline?companyUuid=${loginCompany().uuid}`, {
    method: 'POST'
  });
}

export async function get(param) {
  return request(`/iwms-basic/basic/carrier/${param.uuid}`);
}

export async function batchImport(param) {
  return request(`/iwms-basic/basic/carrier/batchimport?companyUuid=${loginCompany().uuid}&fileKey=${param.fileKey}`, {
    method: 'POST'
  });
}

export async function getImportTemplateUrl() {
  return request(`/iwms-basic/basic/carrier/templet/download`);
}