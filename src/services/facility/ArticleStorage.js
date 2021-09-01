import request from '@/utils/request';

export async function save(payload) {
    return request(`/iwms-facility/facility/articleStorage`, {
        method: 'POST',
        body: payload,
    });
}
export async function query(payload) {
    return request(`/iwms-facility/facility/articleStorage/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/articleStorage/delete?uuid=${payload.uuid}`);
}

export async function getByArticleUuidAndDcUuid(payload) {
    return request(`/iwms-facility/facility/articleStorage/getByArticleUuidAndDcUuid?articleUuid=${payload.articleUuid}&dcUuid=${payload.dcUuid}`, {
        method: 'POST'
    });
}


export async function modify(payload) {
    return request(`/iwms-facility/facility/articleStorage/modify`, {
      method: 'POST',
      body: payload,
    });
  }
export async function get(uuid) {
    return request(`/iwms-facility/facility/articleStorage/${uuid}`);
  }
