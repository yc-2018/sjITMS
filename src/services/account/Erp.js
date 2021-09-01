import { stringify } from 'qs';
import request from '@/utils/request';

export async function get(companyUuid) {
  return request(`/iwms-account/account/erpconfig/bycompany?companyUuid=${companyUuid}`);
}

export async function save(payload) {
  return request(`/iwms-account/account/erpconfig/save`, {
    method: 'POST',
    body: payload,
  });
}
