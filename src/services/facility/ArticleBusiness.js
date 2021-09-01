import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/articleBusiness`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/articleBusiness/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuidAndArticleUuid(payload) {
  return request(`/iwms-facility/facility/articleBusiness/getByDcUuidAndArticleUuid?dcUuid=${loginOrg().uuid}&articleUuid=${payload.articleUuid}`);
}