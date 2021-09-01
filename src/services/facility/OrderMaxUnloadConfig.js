import { stringify } from 'qs';
import request from '@/utils/request';

export async function getByCompanyUuidAndDcUuid(params) {
  return request(`/iwms-facility/facility/orderMaxUnloadConfig/getByCompanyUuidAndDcUuid?${stringify(params)}`);
}
export async function save(params) {
  return request(`/iwms-facility/facility/orderMaxUnloadConfig`, {
    method: 'POST',
    body: params,
  });
}

// export async function modify(params) {
//   return request(`/iwms-facility/facility/orderMaxUnloadConfig/modify`, {
//     method: 'POST',
//     body: params,
//   });
// }