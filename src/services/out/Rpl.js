import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
export async function query(params) {
  return request(`/iwms-facility/facility/rplBill/page`, {
    method: 'POST',
    body: params,
  });
}

export async function modifyRplBill(payload) {
  return request(`/iwms-facility/facility/rplBill/${payload.uuid}/modify?version=${payload.version}`, {
    method: 'POST',
    body: payload.data,
  })
}

export async function onEditMode(params) {
  return request(`/iwms-facility/facility/rplBill/${params.uuid}/modifyRplMode?version=${params.version}`, {
    method: 'POST'
  });
}

export async function get(param) {
  return request(`/iwms-facility/facility/rplBill/${param.uuid}`);
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/rplBill/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function batchAudit(payload) {
  return request(`/iwms-facility/facility/rplBill/${payload.uuid}/batchAudit?version=${payload.version}&rplQtyStr=${payload.rplQtyStr}`, {
    method: 'POST',
    body: payload.rpler,
  });
}

export async function batchPrint(payload) {
  return request(`/iwms-facility/facility/rplBill/printLabel`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/rplBill/${billNumber}/get?dcUuid=${loginOrg().uuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/rplBill/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/rplBill/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
