import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { LOGIN_COMPANY } from '@/utils/constants';

export async function getByCarrier(payload) {
  return request(`/itms-schedule/itms-schedule/newoperation/newCheckInAndCheckOut/getbyEmployee/${payload}/${loginCompany().uuid}/${loginOrg().uuid}`, {
    method: 'GET'
  });
}

export async function updateTime(payload) {
  return request(`/itms-schedule/itms-schedule/newoperation/newCheckInAndCheckOut/updateTime/${payload}/${loginCompany().uuid}/${loginOrg().uuid}`, {
    method: 'POST'
  });
}
