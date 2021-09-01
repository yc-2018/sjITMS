import { stringify } from 'qs';
import request from '@/utils/request';

export async function query(payload) {
    return request(`/iwms-facility/facility/dispatcherconfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function add(payload) {
    return request(`/iwms-facility/facility/dispatcherconfig`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(uuid) {
    return request(`/iwms-facility/facility/dispatcherconfig/${uuid}`, {
      method: 'DELETE',
    });
}
