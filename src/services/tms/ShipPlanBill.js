import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/shipplanbill/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/shipplanbill/${payload}`);
}

export async function getByBillNumber(payload) {
    return request(`/iwms-facility/facility/shipplanbill/getByBillNumber/?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}`);
}

export async function save(payload) {
    return request(`/iwms-facility/facility/shipplanbill`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/shipplanbill/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function modifyBillItem(payload) {
    return request(`/iwms-facility/facility/shipplanbill/modifyBillItem?billUuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST',
        body: payload.items,
    });
}

export async function approve(payload) {
    return request(`/iwms-facility/facility/shipplanbill/approve?billUuid=${payload.uuid}&version=${payload.version}`, {
        method: 'PUT'
    });
}

export async function abort(payload) {
    return request(`/iwms-facility/facility/shipplanbill/abort?billUuid=${payload.uuid}&version=${payload.version}`, {
        method: 'PUT'
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/shipplanbill/${payload.uuid}?version=${payload.version}`, {
        method: 'DELETE',
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/shipplanbill/getLastByBillNumber/?billNumber=${payload}&companyUuid=${loginCompany().uuid}&createOrgUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/shipplanbill/getNextByBillNumber/?billNumber=${payload}&companyUuid=${loginCompany().uuid}&createOrgUuid=${loginOrg().uuid}`);
}
