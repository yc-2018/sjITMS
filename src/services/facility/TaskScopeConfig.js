import request from '@/utils/request';
import { stringify } from 'qs';
export async function query(payload) {
  return request(`/iwms-facility/facility/taskScopeConfig/page`,{
    method: 'POST',
    body: payload,
  });
}

export async function getByTaskerUuidAndDcUuid(payload) {
  return request(`/iwms-facility/facility/taskScopeConfig/getBytaskerUuidAndDcUuid?${stringify(payload)}`);
}

export async function saveOrModify(payload) {
  return request(`/iwms-facility/facility/taskScopeConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/taskScopeConfig/remove?${stringify(payload)}`
  // , {method: 'DELETE'}
  );
}

export async function up(payload) {
  return request(`/iwms-facility/facility/taskScopeConfig/upTaskScope?${stringify(payload)}`,{
    method: 'POST',
  });
}
