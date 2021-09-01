import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { stringify } from 'qs';
export async function saveOrUpdate(payload) {
  return request(`/iwms-facility/facility/rtnCountConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByCompamyUuidAndDcUuid() {
  return request(`/iwms-facility/facility/rtnCountConfig?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}
