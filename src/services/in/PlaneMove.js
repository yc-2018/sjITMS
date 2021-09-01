import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
    return request(`/iwms-facility/facility/planeMoveBill/page`, {
        method: 'POST',
        body: payload
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/planeMoveBill/${payload.uuid}`);
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/planeMoveBill/audit?dcUuid=${payload.dcUuid}&planeMoveBillNumber=${payload.planeMoveBillNumber}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/planeMoveBill/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/planeMoveBill/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/planeMoveBill/${payload.billNumber}/get?dcUuid=${loginOrg().uuid}`);
}
