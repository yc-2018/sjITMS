import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-account/account/importTemplate`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-account/account/importTemplate/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-account/account/importTemplate/remove?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function getPath(payload) {
  return request(`/iwms-account/account/importTemplate/getPath?type=${payload.type}`, {
    method: 'POST',
  });
}

export async function queryAll(payload) {
  return request(`/iwms-account/account/importTemplate/queryAll`, {
    method: 'POST',
  });
}

