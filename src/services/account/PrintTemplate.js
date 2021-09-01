import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-account/account/template`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-account/account/template/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-account/account/template/remove?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function queryAll(payload) {
  return request(`/iwms-account/account/template/queryAll?orgUuid=${payload.orgUuid}`,{
    method: 'GET'
  });
}

export async function get(payload) {
  return request(`/iwms-account/account/template/${payload.uuid}`,{
    method: 'GET'
  });
}

export async function queryByTypeAndOrgUuid(payload) {
  return request(`/iwms-account/account/template/queryByTypeAndOrgUuid?orgUuid=${payload.orgUuid}&type=${payload.printType}`,{
    method: 'GET'
  });
}

