import request from '@/utils/request';

export async function save(payload) {
    return request(`/iwms-facility/facility/pickareaStorageConfig`, {
        method: 'POST',
        body: payload,
    });
}
export async function query(payload) {
    return request(`/iwms-facility/facility/pickareaStorageConfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/pickareaStorageConfig/remove?uuid=${payload.uuid}`, {
        method: 'POST'
    });
}

export async function getByDCUuidAndPickareaUuid(payload) {
    return request(`/iwms-facility/facility/pickareaStorageConfig/getByDCUuidAndPickareaUuid?pickareaUuid=${payload.pickareaUuid}&dcUuid=${payload.dcUuid}`);
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/pickareaStorageConfig/modify`, {
    method: 'POST',
    body: payload,
  });
}
