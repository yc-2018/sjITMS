import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/storehandover/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/storehandover?uuid=${payload}`);
}

export async function getByBillNumber(payload) {
    return request(`/iwms-facility/facility/storehandover/get?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}`);
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/storehandover`, {
        method: 'POST',
        body: payload,
    });
}

export async function dcconfirm(payload) {
    return request(`/iwms-facility/facility/storehandover/dcconfirm?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST',
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/storehandover/getLastByBillNumber/?billNumber=${payload}&companyUuid=${loginCompany().uuid}&createOrgUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/storehandover/getNextByBillNumber/?billNumber=${payload}&companyUuid=${loginCompany().uuid}&createOrgUuid=${loginOrg().uuid}`);
}
