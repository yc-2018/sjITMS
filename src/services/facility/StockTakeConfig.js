import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function saveOrUpdate(payload) {
  return request(`/iwms-facility/facility/stockTakeConfig/saveOrUpdate`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuid() {
  return request(`/iwms-facility/facility/stockTakeConfig/getByDcUuid?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}

