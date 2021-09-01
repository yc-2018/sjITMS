import { stringify } from 'qs';
import request from '@/utils/request';

export async function getByDcUuid(params) {
  return request(`/iwms-facility/facility/printLabelConfig/getByDcUuid?${stringify(params)}`);
}
export async function insert(params) {
  return request(`/iwms-facility/facility/printLabelConfig`, {
    method: 'POST',
    body: params,
  });
}

export async function modify(params) {
  return request(`/iwms-facility/facility/printLabelConfig/modify`, {
    method: 'POST',
    body: params,
  });
}
