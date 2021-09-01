import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/timeIntervalConfig?companyUuid=${loginCompany().uuid}&timeInterval=${payload.timeInterval}`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByCompanyUuid() {
  return request(`/iwms-facility/facility/timeIntervalConfig/getByCompanyUuid?companyUuid=${loginCompany().uuid}`);
}