import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
  return request(`/iwms-facility/facility/adj/page`, {
    method: 'POST',
    body: payload
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/adj/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/adj/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function get(uuid) {
  return request(`/iwms-facility/facility/adj/${uuid}`);
}

export async function getByBillNumber(billNumber) {
  return request(`/iwms-facility/facility/adj/${billNumber}/get?dcUuid=${loginOrg().uuid}`);
}

export async function add(payload) {
  return request(`/iwms-facility/facility/adj`,{
    method: 'POST',
    body: payload,
  });
}

export async function saveAndApprove(payload) {
  return request(`/iwms-facility/facility/adj/saveAndAudit`,{
    method: 'POST',
    body: payload,
  });
}

export async function update(payload) {
  return request(`/iwms-facility/facility/adj/modify`,{
    method: 'POST',
    body: payload,
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/adj/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/adj/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
