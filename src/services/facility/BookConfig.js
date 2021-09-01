import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function saveOrUpdate(payload) {
  return request(`/iwms-facility/facility/bookConfig/saveOrUpdate`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByCompanyUuidAndDcUuid() {
  return request(`/iwms-facility/facility/bookConfig/getByCompanyUuidAndDcUuid?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}

