import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
export async function saveOrUpdate(payload) {
  return request(`/iwms-facility/facility/receiveverify/saveOrUpdate`, {
    method: 'POST',
    body: payload,
  });
}

export async function get() {
  return request(`/iwms-facility/facility/receiveverify/getByCompanyUuidAndDcUuid?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}
