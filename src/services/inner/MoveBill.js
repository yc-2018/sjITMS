import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/move/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/move/${payload}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/move/getByBillNumber?billNumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/move/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/move/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function save(payload) {
    return request(`/iwms-facility/facility/move/save`, {
      method: 'POST',
      body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/move/modify`, {
      method: 'POST',
      body: payload,
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/move/audit/byBillUuid?billUuid=${payload.uuid}&version=${payload.version}`, {
      method: 'PUT'
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/move/remove?billUuid=${payload.uuid}&version=${payload.version}`, {
      method: 'PUT',
    });
}

export async function saveAndAudit(payload) {
  return request(`/iwms-facility/facility/move/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}



