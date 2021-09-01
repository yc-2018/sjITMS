import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/containermerger/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/containermerger/${payload}`);
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/containermerger/audit/byBillUuid?billUuid=${payload.uuid}&version=${payload.version}`, {
      method: 'PUT',
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/containermerger/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/containermerger/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByNumber(payload) {
  return request(`/iwms-facility/facility/containermerger/getByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}


