import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/attachmentconfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryNeedCheckedAttachments(payload) {
    return request(`/iwms-facility/facility/attachmentconfig/needCheckedAttachments?dcUuid=${payload.dcUuid}`);
}

export async function save(payload) {
    return request(`/iwms-facility/facility/attachmentconfig`, {
        method: 'PUT',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/attachmentconfig`, {
        method: 'POST',
        body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/attachmentconfig?uuid=${payload}`);
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/attachmentconfig/remove?uuid=${payload}`, {
        method: 'PUT'
    });
}