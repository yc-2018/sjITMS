import { stringify } from 'qs';
import request from '@/utils/request';

export async function getByCompanyUuid(payload) {
  return request(`/iwms-facility/facility/stockBatchConfig/getByCompanyUuid?companyUuid=${payload.companyUuid}`);
}

export async function saveOrUpdate(payload) {
  return request(`/iwms-facility/facility/stockBatchConfig/saveOrUpdate`, {
    method: 'POST',
    body: payload,
  });
}
