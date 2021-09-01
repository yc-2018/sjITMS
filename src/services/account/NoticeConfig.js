import { stringify } from 'qs';
import request from '@/utils/request';

export async function query(payload) {
  return request(`/iwms-account/account/noticeconfig/query?${stringify(payload)}`);
}

export async function insert(payload) {
  return request(`/iwms-account/account/noticeconfig/save`, {
    method: 'POST',
    body: payload,
  });
}
