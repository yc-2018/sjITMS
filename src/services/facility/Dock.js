import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
export async function get(payload) {
  return request(`/iwms-facility/facility/dock/${payload}`);
}
export async function queryByDockGroup(payload) {
  return request(`/iwms-facility/facility/dock/${payload.dockGroupUuid}/queryByDockGroup`);
}

export async function query(payload) {
  return request(`/iwms-facility/facility/dock/page`, {
    method: 'POST',
    body: payload,
  });
}
export async function save(payload) {
  return request(`/iwms-facility/facility/dock`,{
    method: 'POST',
    body: payload,
  });
}
export async function modify(payload) {
  return request(`/iwms-facility/facility/dock/modify`,{
    method: 'POST',
    body: payload,
  });
}
export async function disable(payload) {
  return request(`/iwms-facility/facility/dock/${payload.uuid}/disable?version=${payload.version}`, {
    method: 'POST',
  });
}
export async function enable(payload) {
  return request(`/iwms-facility/facility/dock/${payload.uuid}/enable?version=${payload.version}`, {
    method: 'POST',
  });
}
export async function stateModify(payload) {
  return request(`/iwms-facility/facility/dock/${payload.uuid}/updateState?state=${payload.state}&version=${payload.version}`,{
    method: 'POST'
  });
}
export async function getByCode(payload) {
  const companyUuid = loginCompany().uuid;
  const dcUuid = loginOrg().uuid;
  return request(`/iwms-facility/facility/dock/getByCode?companyUuid=${companyUuid}&dcUuid=${dcUuid}&code=${payload.entityCode}`);
}
