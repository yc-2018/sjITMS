import request from '@/utils/request';
import { stringify } from 'qs';
export async function query(payload) {
  return request(`/iwms-facility/facility/pickScopeConfig/page`,{
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuidAndPickerUuid(payload) {
  return request(`/iwms-facility/facility/pickScopeConfig/getByDcUuidAndPickerUuid?${stringify(payload)}`);
}

export async function saveOrModify(payload) {
  return request(`/iwms-facility/facility/pickScopeConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/pickScopeConfig/delete?${stringify(payload)}`, {
    method: 'DELETE',
  });
}
