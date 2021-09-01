import request from '@/utils/request';

export async function save(payload) {
    return request(`/iwms-facility/facility/binTypeStorage`, {
        method: 'POST',
        body: payload,
    });
}
export async function query(payload) {
    return request(`/iwms-facility/facility/binTypeStorage/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/binTypeStorage/remove?uuid=${payload.uuid}`);
}

export async function getByBinTypeUuidAndDcUuid(payload) {
    return request(`/iwms-facility/facility/binTypeStorage/getByBinTypeUuidAndDcUuid?binTypeUuid=${payload.binTypeUuid}&dcUuid=${payload.dcUuid}`, {
        method: 'POST'
    });
}
