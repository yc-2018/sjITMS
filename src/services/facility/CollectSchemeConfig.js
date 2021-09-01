import request from '@/utils/request';
import { stringify } from 'qs';
export async function saveOrModify(payload) {
  return request(`/iwms-facility/facility/collectSchemeConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuid(payload) {
  return request(`/iwms-facility/facility/collectSchemeConfig/get?${stringify(payload)}`);
}