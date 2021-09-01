
import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-account/account/org/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryByUuids(payload) {
  return request(`/iwms-account/account/org/querybyuuids`, {
    method: 'POST',
    body: payload,
  });
}