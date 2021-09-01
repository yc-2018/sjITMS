import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/billImport`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/billImport/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/billImport/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/billImport/${payload}`);
}

export async function getByOwnerAndBillType(payload) {
  return request(`/iwms-facility/facility/billImport/getByOwnerAndBillType?dcUuid=${loginOrg().uuid}&ownerUuid=${payload.ownerUuid}&billType=${payload.billType}`);
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/billImport/remove/${payload}`, {
    method: 'DELETE'
  });
}

export async function getBillFieldItems(payload) {
  return request(`/iwms-facility/facility/billImport/getBillFieldItems/${payload}`, {
    method: 'POST'
  });
}

export async function billImport(payload) {
  return request(`/iwms-facility/facility/billImport/billImport?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&mouldUuid=${payload.mouldUuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}

