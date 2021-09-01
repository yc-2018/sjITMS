import request from '@/utils/request';

export async function save(payload) {
    return request(`/iwms-facility/facility/vendorpickerconfig`, {
        method: 'POST',
        body: payload,
    });
}
export async function query(payload) {
    return request(`/iwms-facility/facility/vendorpickerconfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/vendorpickerconfig/remove?uuid=${payload.uuid}`, {
        method: 'POST'
    });
}
