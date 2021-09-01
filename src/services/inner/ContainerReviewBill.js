import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/containerreview/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/containerreview?uuid=${payload}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/containerreview/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/containerreview/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/containerreview/${billNumber}/getByBillNumber?dcUuid=${loginOrg().uuid}`);
}
