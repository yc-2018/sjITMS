import { stringify } from 'qs';
import request from '@/utils/request';
import { async } from 'q';
import {loginCompany} from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/workingScheme`,{
    method: 'POST',
    body: payload,
  });
}
export async function getByUuid(uuid) {
  return request(`/iwms-facility/facility/workingScheme/${uuid}`);
}

export async function getByCompanyUuidAndCode(code) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-facility/facility/workingScheme/${code}?companyUuid=${companyUuid}`);
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/workingScheme/modify`,{
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/workingScheme/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function online(payload) {
  return request(`/iwms-facility/facility/workingScheme/${payload.uuid}/online?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function offline(payload) {
  return request(`/iwms-facility/facility/workingScheme/${payload.uuid}/offline?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/workingScheme/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}




