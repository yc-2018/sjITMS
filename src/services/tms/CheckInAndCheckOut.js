import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { LOGIN_COMPANY } from '@/utils/constants';

export async function getByCarrier(payload) {
  return request(`/itms-schedule/itms-schedule/ship/getbyEmployee?employeeCode=${payload}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`, {
    method: 'GET'
  });
}

export async function updateTime(payload) {
  return request(`/itms-schedule/itms-schedule/ship/updateTime?billNumber=${payload}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`, {
    method: 'POST'
  });
}
