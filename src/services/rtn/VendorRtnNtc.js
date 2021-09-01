import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc`, {
        method: 'POST',
        body: payload,
    });
}
export async function saveAndApprove(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/save/approve`, {
        method: 'POST',
        body: payload
    });
}
export async function modify(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function copy(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/copy?uuid=${payload}`, {
        method: 'POST'
    });
}

export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc?uuid=${payload}`);
}

export async function query(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function generatePickUpBill(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/generate?dcUuid=${payload.dcUuid}`, {
        method: 'POST',
        body: payload.billNumbers
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/audit?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function finish(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/finish?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function abort(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/abort?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function rollback(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/rollback?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function confirm(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/confirm?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function batchImport(payload) {
    return request(`/iwms-facility/facility/vendorrtnntc/batchimport?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
        method: 'POST'
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/vendorrtnntc/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/vendorrtnntc/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/vendorrtnntc/getByBillNumber?billNumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}
