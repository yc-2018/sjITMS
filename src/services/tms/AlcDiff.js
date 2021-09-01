import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/alcdiff/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/alcdiff?uuid=${payload}`);
}

export async function previousBill(payload) {
    return request(`/iwms-facility/facility/alcdiff/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
    return request(`/iwms-facility/facility/alcdiff/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/alcdiff/getByBillNumber?billNumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}
export async function save(payload) {
    return request(`/iwms-facility/facility/alcdiff`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/alcdiff/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/alcdiff/audit?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/alcdiff/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST',
    });
}
