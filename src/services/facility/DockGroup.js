import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function queryDockGroup(payload) {
    return request(`/iwms-facility/facility/dockgroup/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function getDockGroupByCompanyUuid(payload) {
  return request(`/iwms-facility/facility/dockgroup/getByCompanyAndDc?companyUuid=${payload.companyUuid}&&dcUuid=${loginOrg().type === 'DC' ? loginOrg().uuid : payload.dcUuid}`);
}

export async function getDockGroup(payload) {
  return request(`/iwms-facility/facility/dockgroup/${payload}`);
}

export async function saveDockGroup(payload) {
  return request(`/iwms-facility/facility/dockgroup`,{
    method: 'POST',
    body: payload,
  });
}

export async function modifyDockGroup(payload) {
    return request(`/iwms-facility/facility/dockgroup/modify`,{
      method: 'POST',
      body: payload,
    });
}

export async function deleteDockGroup(payload) {
  return request(`/iwms-facility/facility/dockgroup/remove/${payload}`,{
    method: 'POST'
  });
}
