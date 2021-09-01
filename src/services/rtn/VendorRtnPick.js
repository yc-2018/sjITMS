import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick?uuid=${payload}`);
}

export async function query(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function alterMethod(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick/alter/method?uuid=${payload.uuid}&version=${payload.version}&method=${payload.method}`, {
            method: 'POST'
        });
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/vendorrtnpick/number?billNumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}

export async function alterPicker(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick/alter/picker?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST',
        body: payload.picker,
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick/audit`, {
        method: 'POST',
        body: payload
    });
}

export async function auditWhole(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick/audit/whole?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST',
        body: payload.body
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/vendorrtnpick/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/vendorrtnpick/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
