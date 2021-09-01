import {stringify} from 'qs';
import request from '@/utils/request';
import {loginCompany,loginOrg} from '@/utils/LoginContext';

// export async function save(payload) {
//   return request(`/iwms-facility/facility/pickarea`, {
//     method: 'POST',
//     body: payload,
//   });
// }

// export async function deletePickArea(payload) {
//   return request(`/iwms-facility/facility/pickarea/${payload.uuid}/remove?version=${payload.version}`, {
//     method: 'POST',
//   });
// }

// export async function modify(payload) {
//   return request(`/iwms-facility/facility/pickarea/modify`, {
//     method: 'POST',
//     body: payload,
//   });
// }

export async function query(payload) {
  return request(`/iwms-facility/facility/moveRuleConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDCUuidAndFromBinUsage(fromBinUsag) {
  return request(`/iwms-facility/facility/moveRuleConfig/getByDCUuidAndFromBinUsage?fromBinUsag=${fromBinUsag}&dcUuid=${loginOrg().uuid}`);
}

// export async function get(uuid) {
//   return request(`/iwms-facility/facility/pickarea/${uuid}`);
// }

// export async function getByCodeAndDCUuid(payload) {
//   const code = payload.code;
//   const dcUuid = payload.dcUuid;
//   return request(`/iwms-facility/facility/pickarea/ByCodeAndDCUuid?code=${code}&dcUuid=${dcUuid}`);
// }