import request from '@/utils/request';

export async function save(payload) {
    return request(`/iwms-facility/facility/bintype`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/bintype/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/bintype?uuid=${payload.uuid}`);
}

export async function getByDcUuid(payload) {
    return request(`/iwms-facility/facility/bintype/list/${payload}`);
}

export async function query(payload) {
    return request(`/iwms-facility/facility/bintype/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/bintype/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}


export async function getByCodeAndDcUuid(payload) {
  return request(`/iwms-facility/facility/bintype/getByCodeAndDcUuid?code=${payload.code}&dcUuid=${payload.dcUuid}`);
}
