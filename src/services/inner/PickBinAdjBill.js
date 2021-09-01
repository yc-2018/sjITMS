import request from '@/utils/request';
import {loginCompany,loginOrg} from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/pickbinadj`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/pickbinadj/savemodify`, {
        method: 'POST',
        body: payload,
    });
}


export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/pickbinadj?uuid=${payload}`);
}

export async function getByBillNumber(payload) {
    return request(`/iwms-facility/facility/pickbinadj/getByBillNumber?billnumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}

export async function getByBillNumberAndDcUuid(payload) {
    return request(`/iwms-facility/facility/pickbinadj/${payload.billNumber}?dcUuid=${payload.dcUuid}`);
}


export async function query(payload) {
    return request(`/iwms-facility/facility/pickbinadj/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/pickbinadj/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/pickbinadj/audit?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function saveAndAudit(payload) {
    return request(`/iwms-facility/facility/pickbinadj/saveAndAudit`, {
        method: 'POST',
        body: payload,
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/pickbinadj/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/pickbinadj/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
