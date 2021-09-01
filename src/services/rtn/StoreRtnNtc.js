import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/storertnntc`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/storertnntc/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/storertnntc?uuid=${payload}`);
}

export async function getByBillNumberAndDcUuid(payload) {
    return request(`/iwms-facility/facility/storertnntc/number?billNumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}


export async function query(payload) {
    return request(`/iwms-facility/facility/storertnntc/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/storertnntc/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function finish(payload) {
    return request(`/iwms-facility/facility/storertnntc/finish?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function abort(payload) {
    return request(`/iwms-facility/facility/storertnntc/abort?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function approve(payload) {
    return request(`/iwms-facility/facility/storertnntc/approve?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function batchImport(payload) {
    return request(`/iwms-facility/facility/storertnntc/batchimport?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
        method: 'POST'
    });
}

export async function copy(payload) {
    return request(`/iwms-facility/facility/storertnntc/copy?uuid=${payload}`, {
        method: 'POST'
    });
}

export async function saveAndApprove(payload) {
    return request(`/iwms-facility/facility/storertnntc/save/approve`, {
        method: 'POST',
        body: payload
    });
}
// export async function getImportTemplateUrl() {
//     return request(`/iwms-facility/facility/storertnntc/templet/download`);
// }

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/storertnntc/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/storertnntc/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
