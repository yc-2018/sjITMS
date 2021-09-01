import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
export async function query(payload) {
  return request(`/iwms-facility/facility/crosspick/page`, {
    method: 'POST',
    body: payload,
  });
}
export async function modifyCrossPickUpBill(payload) {
  return request(`/iwms-facility/facility/crosspick/modify`, {
    method: 'POST',
    body: payload,
  })
}

export async function get(payload) {
  return request(`/iwms-facility/facility/crosspick/${payload.uuid}`);
}

export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/crosspick/${billNumber}/getByBillNumber?dcUuid=${loginOrg().uuid}`);
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/crosspick/${payload.uuid}/normalAudit/?version=${payload.version}`, {
    method: 'POST',
    body: payload,
  })
}


export async function modifyPicker(payload) {
  return request(`/iwms-facility/facility/crosspick/${payload.uuid}/modifyPicker?version=${payload.version}`, {
    method: 'POST',
    body: payload.picker,
  })
}

export async function modifyOperateMethod(payload) {
  return request(`/iwms-facility/facility/crosspick/${payload.uuid}/modifyOperateMethod?version=${payload.version}`, {
    method: 'POST',
  })
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/crosspick/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/crosspick/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
