import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
  return request(`/iwms-facility/facility/dec/page`, {
    method: 'POST',
    body: payload
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/dec/${payload.uuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/dec/${payload.billNumber}/get?dcUuid=${payload.dcUuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/dec/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/dec/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/dec/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST',
    body: payload.decInvRealQtys,
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/dec`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveAndApprove(payload) {
  return request(`/iwms-facility/facility/dec/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/dec/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/dec/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function queryDecAbleStock(payload) {
  return request(`/iwms-facility/facility/dec/queryDecAbleStock`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryDecBins(payload) {
  return request(`/iwms-facility/facility/dec/queryDecBins?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&wrhUuid=${payload.wrhUuid}&binCode=${payload.binCode}`);
}
