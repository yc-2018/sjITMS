import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function queryArticleItem(payload) {

  return request(`/itms-schedule/itms-schedule/ship/queryArticleItem`, {
    method: 'POST',
    body: payload

  });
}

export async function confirmed(payload) {
  return request(`/itms-schedule/itms-schedule/ship/confirmed`, {
    method: 'POST',
    body: payload
  });
}