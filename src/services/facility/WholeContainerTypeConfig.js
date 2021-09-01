import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/wholecontainertypeconfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function save(payload) {
    return request(`/iwms-facility/facility/wholecontainertypeconfig`, {
        method: 'PUT',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/wholecontainertypeconfig/${payload}`, {
        method: 'DELETE'
    });
}