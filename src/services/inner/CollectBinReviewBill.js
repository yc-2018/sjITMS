import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/collectbinreview/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/collectbinreview?billUuid=${payload}`);
}

export async function queryStoreInfos(payload) {
  return request(`/iwms-facility/facility/collectbinreview/queryStoreInfos`, {
    method: 'POST',
    body: payload,
  });
}


export async function batchReview(payload) {
  return request(`/iwms-facility/facility/collectbinreview/batchReview`, {
    method: 'POST',
    body: payload,
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/collectbinreview/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/collectbinreview/${billNumber}/getByBillNumber?dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/collectbinreview/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
