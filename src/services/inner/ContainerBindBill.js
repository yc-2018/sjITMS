import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-facility/facility/containerbind/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/containerbind?uuid=${payload}`);
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/containerbind/audit/inprogress?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'POST'
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/containerbind/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/containerbind/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/containerbind/${billNumber}/getByBillNumber?dcUuid=${loginOrg().uuid}`);
}
