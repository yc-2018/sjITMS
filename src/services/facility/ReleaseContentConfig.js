import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/releasecontentconfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function save(payload) {
    return request(`/iwms-facility/facility/releasecontentconfig`, {
        method: 'POST',
        body: payload,
    });
}
export async function modify(payload) {
    return request(`/iwms-facility/facility/releasecontentconfig/modify`, {
      method: 'POST',
      body: payload,
    });
}
export async function remove(payload) {
    return request(`/iwms-facility/facility/releasecontentconfig/remove?uuid=${payload.uuid}`,{
        method:'POST'
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/releasecontentconfig/get?uuid=${payload.uuid}`);
}