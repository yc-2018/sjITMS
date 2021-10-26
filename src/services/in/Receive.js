import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
export async function query(params) {
  return request(`/iwms-facility/facility/receive/page`, {
    method: 'POST',
    body: params,
  });
}

export async function add(params) {
  return request(`/iwms-facility/facility/receive`, {
    method: 'POST',
    body: params,
  });
}

export async function saveAndAudit(params) {
  return request(`/iwms-facility/facility/receive/saveAndAudit`, {
    method: 'POST',
    body: params,
  });
}

export async function update(params) {
  return request(`/iwms-facility/facility/receive/modify`, {
    method: 'POST',
    body: params,
  });
}

export async function get(param) {
  return request(`/iwms-facility/facility/receive/${param.uuid}`);
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/receive/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE'
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/receive/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function queryInProgress(param) {
  return request(`/iwms-facility/facility/receive/queryInProgress?orderBillNumber=${param.orderBillNumber}&dcUuid=${loginOrg().uuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/receive/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/receive/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByBillNumber(param) {
  return request(`/iwms-facility/facility/receive/${param.billNumber}/get?dcUuid=${loginOrg().uuid}`);
}

export async function getBatchConfiguration(param) {
  return request(`/iwms-facility/facility/receive/queryBatchConfiguration?dcUuid=${param.dcUuid}&ownerCode=${param.ownerCode}`);
}