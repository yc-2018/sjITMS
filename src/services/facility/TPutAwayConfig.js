import { stringify } from 'qs';
import request from '@/utils/request';

export async function getByCompanyUuidAndDcUuid(params) {
  return request(`/iwms-facility/facility/putawayconfig/getByCompanyUuidAndDcUuid?${stringify(params)}`);
}
export async function insert(params) {
  return request(`/iwms-facility/facility/putawayconfig`, {
    method: 'POST',
    body: params,
  });
}

export async function modify(params) {
  return request(`/iwms-facility/facility/putawayconfig/modify`, {
    method: 'POST',
    body: params,
  });
}