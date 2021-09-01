import request from '@/utils/request';

export async function save(payload) {
  return request(`/iwms-facility/facility/articlePlate`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/articlePlate/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByArticleUuid(payload) {
  return request(`/iwms-facility/facility/articlePlate/getByDcUuidAndArticleUuid?dcUuid=${payload.dcUuid}&articleUuid=${payload.articleUuid}`);
}