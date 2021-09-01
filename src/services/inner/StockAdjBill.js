import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
  return request(`/iwms-facility/facility/stockadj/page`, {
    method: 'POST',
    body: payload
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/stockadj/${payload.uuid}`);
}
export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/stockadj/${payload.billNumber}/get?dcUuid=${payload.dcUuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/stockadj/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/stockadj/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/stockadj/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/stockadj`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/stockadj/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/stockadj/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function getBinUsagesByConfigType(payload) {
  return request(`/iwms-facility/facility/binUsageConfig/getByConfigType?dcUuid=${loginOrg().uuid}&configType=${payload}`);
}

export async function saveAndAudit(payload) {
  return request(`/iwms-facility/facility/stockadj/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}