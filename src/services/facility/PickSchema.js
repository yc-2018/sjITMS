import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/pickscheme`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuidAndArticleUuid(payload) {
  return request(`/iwms-facility/facility/pickscheme/article?articleUuid=${payload.articleUuid}&dcUuid=${loginOrg().uuid}`);
}

export async function query(payload) {
  return request(`/iwms-facility/facility/pickscheme/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryByArticles(payload) {
  return request(`/iwms-facility/facility/pickscheme/queryByArticles?dcUuid=${loginOrg().uuid}`,{
    method: 'POST',
    body: payload.articleUuids,
  });
}
