import request from '@/utils/request';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-account/account/user/page?orgUuid=${loginOrg().uuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-account/account/user`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-account/account/user/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteUser(payload) {
  return request(`/iwms-account/account/user/${payload.uuid}?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function get(uuid) {
  return request(`/iwms-account/account/user/${uuid}?orgUuid=${loginOrg().uuid}`);
}

export async function checkByPhone(phone) {
  return request(`/iwms-account/account/user/checkByPhone?phone=${phone}`);
}

export async function batchImport(payload) {
  return request(`/iwms-account/account/user/batchimport?companyUuid=${loginCompany().uuid}&orgUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}

export async function online(payload) {
  return request(`/iwms-account/account/user/${payload.uuid}/online?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function offline(payload) {
  return request(`/iwms-account/account/user/${payload.uuid}/offline?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function getResourcesByUser(payload) {
  return request(`/iwms-account/account/user/${loginUser().uuid}/resources?orgUuid=${loginOrg().uuid}`);
}

export async function queryForShipBill(payload) {
  return request(`/iwms-account/account/user/page?orgUuid=${payload.uuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByCodeAndOrgUuid(payload) {
  return request(`/iwms-account/account/user/getByCodeAndOrgUuid?code=${payload.code}&orgUuid=${payload.companyUuid}`);
}
