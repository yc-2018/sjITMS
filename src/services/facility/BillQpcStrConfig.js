import request from '@/utils/request';
import { stringify } from 'qs';
export async function modify(payload) {
  return request(`/iwms-facility/facility/billQpcStr/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuid(payload) {
  return request(`/iwms-facility/facility/billQpcStr/getByDcUuid?${stringify(payload)}`);
}

export async function getByBillType(payload) {
  return request(`/iwms-facility/facility/billQpcStr/getByDcUuidAndBillType?${stringify(payload)}`);
}