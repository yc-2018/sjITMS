import { stringify } from 'qs';
import request from '@/utils/request';
import {loginCompany,loginOrg} from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/vendorhandover`, {
        method: 'POST',
        body: payload,
    });
}

export async function saveAndAudit(payload) {
    return request(`/iwms-facility/facility/vendorhandover/save/audit`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/vendorhandover/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/vendorhandover?uuid=${payload}`);
}

export async function query(payload) {
    return request(`/iwms-facility/facility/vendorhandover/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/vendorhandover/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/vendorhandover/audit?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function auditInprogress(payload) {
    return request(`/iwms-facility/facility/vendorhandover/audit/inprogress?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/vendorhandover/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/vendorhandover/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/vendorhandover/getByBillNumber?billNumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}
