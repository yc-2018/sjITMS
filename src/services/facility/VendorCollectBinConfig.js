import request from '@/utils/request';

export async function save(payload) {
    return request(`/iwms-facility/facility/vendorcollectbinconfig`, {
        method: 'POST',
        body: payload,
    });
}
export async function query(payload) {
    return request(`/iwms-facility/facility/vendorcollectbinconfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/vendorcollectbinconfig/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}
