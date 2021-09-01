import { stringify } from 'qs';
import request from '@/utils/request';
import { async } from 'q';
import {loginCompany} from '@/utils/LoginContext';
import { func } from 'prop-types';

export async function save(payload) {
  return request(`/iwms-basic/basic/store`,{
    method: 'POST',
    body: payload,
  });
}
export async function getByCompanyUuidAndUuid(uuid) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/store/${uuid}?companyUuid=${companyUuid}`);
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/store/modify`,{
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/store/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function enable(payload) {
  return request(`/iwms-basic/basic/store/${payload.uuid}/enable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function disable(payload) {
  return request(`/iwms-basic/basic/store/${payload.uuid}/disable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function saveStoreType(payload) {
  return request(`/iwms-basic/basic/store/type`,{
    method: 'POST',
    body: payload.creation,
  });
}

export async function getStoreTypesByCompanyUuid(payload) {
  return request(`/iwms-basic/basic/store/type?companyUuid=${payload}`);
}

export async function batchImport(payload) {
  return request(`/iwms-basic/basic/store/batchimport?companyUuid=${loginCompany().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}

export async function getByCompanyUuidAndCode(payload) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/store/getByCompanyUuidAndCode?companyUuid=${companyUuid}&code=${payload}`);
}

export async function saveStoreTms(payload){
  return request(`/iwms-basic/basic/store/saveStoreTms`,{
    method: 'POST',
    body: payload,
  });
}

export async function modifyStoreTms(payload){
  return request(`/iwms-basic/basic/store/modifyStoreTms`,{
    method: 'POST',
    body: payload,
  });
}


export async function modifyAllowReceiveDay(payload){
  return request(`/iwms-basic/basic/store/modifyAllowReceiveDay`,{
    method: 'POST',
    body: payload,
  });
}



