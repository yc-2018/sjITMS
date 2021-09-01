import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/storertn`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/storertn/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/storertn?uuid=${payload}`);
}

export async function previousBill(payload) {
    return request(`/iwms-facility/facility/storertn/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
    return request(`/iwms-facility/facility/storertn/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function query(payload) {
    return request(`/iwms-facility/facility/storertn/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/storertn/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/storertn/audit?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function auditByState(payload) {
    return request(`/iwms-facility/facility/storertn/audit/state?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function querytargetbin(payload) {
    return request(`/iwms-facility/facility/storertn/querytargetbin`, {
        method: 'POST',
        body: payload,
    });
}

export async function saveAndAudit(payload) {
    return request(`/iwms-facility/facility/storertn/save/audit`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryBinAndContainer(payload) {
    return request(`/iwms-facility/facility/storertn/queryBinAndContainer?vendorUuid=${payload.vendorUuid}&dcUuid=${payload.dcUuid}`);
}

export async function queryBinAndContainerRntWrh(payload) {
  return request(`/iwms-facility/facility/storertn/queryBinAndContainerRntWrh?articleUuid=${payload.articleUuid}&dcUuid=${payload.dcUuid}`);
}

export async function queryMaxContainerByBinCode(payload) {
  return request(`/iwms-facility/facility/storertn/queryMaxContainerByBinCode?binCode=${payload.binCode}&companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/storertn/${payload.billNumber}?dcUuid=${payload.dcUuid}`);
}
