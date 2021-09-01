import request from '@/utils/request';
import { stringify } from 'qs';
export async function saveOrUpdate(payload) {
  return request(`/iwms-facility/facility/stockOutConfig/saveOrUpdate`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuid(payload) {
  return request(`/iwms-facility/facility/stockOutConfig/getByDcUuid?${stringify(payload)}`);
}