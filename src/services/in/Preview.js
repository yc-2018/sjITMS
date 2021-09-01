import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
    return request(`/iwms-facility/facility/prevexam/page`, {
        method: 'POST',
        body: payload
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/prevexam/${payload}`,{
        method: 'GET'
    });
}

export async function getByGroupNo(payload) {
    return request(`/iwms-facility/facility/prevexam/getByGroupNo?dcUuid=${loginOrg().uuid}&groupNo=${payload.groupNo}&ocrDate=${payload.ocrDate}`,{
        method: 'GET'
    });
}


export async function audit(payload) {
    return request(`/iwms-facility/facility/prevexam/audit`, {
        method: 'POST',
        body: payload
    });
}

export async function finish(payload) {
    return request(`/iwms-facility/facility/prevexam/finish?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST',
    });
}

export async function byorders(payload) {
    return request(`/iwms-facility/facility/prevexam/byorders?dcUuid=${payload.dcUuid}`, {
        method: 'POST',
        body: payload
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/prevexam/modify?dcUuid=${payload.dcUuid}`, {
        method: 'POST',
        body: payload
    });
}

export async function save(payload) {
    return request(`/iwms-facility/facility/prevexam/save?dcUuid=${loginOrg().uuid}`, {
        method: 'POST',
        body: payload
    });
}

export async function saveAndAudit(payload) {
    return request(`/iwms-facility/facility/prevexam/saveAndAudit?dcUuid=${payload.dcUuid}`, {
        method: 'POST',
        body: payload
    });
}

export async function byOrders(payload) {
  return request(`/iwms-facility/facility/prevexam/byorders?dcUuid=${loginOrg().uuid}`, {
    method: 'POST',
    body: payload
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/prevexam/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/prevexam/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

