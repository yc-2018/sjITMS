import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-facility/facility/close/page`, {
    method: 'POST',
    body: payload
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/close/${payload.uuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/close/${payload.billNumber}/get?dcUuid=${payload.dcUuid}`);
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/close/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/close`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveAndApprove(payload) {
  return request(`/iwms-facility/facility/close/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/close/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/close/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function queryCloseBin(payload) {
  // return request(`/iwms-facility/facility/close/getCloseBin?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}
  // &binCode=${payload.binCode}`);
  return request(`/iwms-facility/facility/close/queryCloseBin?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}
  &binCode=${payload.binCode}`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryUnCloseBin(payload) {
  // return request(`/iwms-facility/facility/close/queryUnCloseBin?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}
  // &binCode=${payload.searchKeyValues.binCode}`);
  return request(`/iwms-facility/facility/close/queryUnCloseBin?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}
  &binCode=${payload.binCode}`, {
    method: 'POST',
    body: payload,
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/close/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/close/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
