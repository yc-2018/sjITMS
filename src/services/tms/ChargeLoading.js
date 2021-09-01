import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { LOGIN_COMPANY } from '@/utils/constants';

export async function getByCarrier(payload) {
  return request(`/itms-schedule/itms-schedule/getunshipedbillbydriver?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&driverCode=${payload}`, {
    method: 'GET'
  });
}

export async function beginloading(payload) {
  return request(`/itms-schedule/itms-schedule/beginloading?scheduleBillUuid=${payload.scheduleBillUuid}`, {
    method: 'POST'
  });
}

export async function finishloading(payload) {
  return request(`/itms-schedule/itms-schedule/finishloading?scheduleBillUuid=${payload.scheduleBillUuid}`, {
    method: 'POST',    
  }, true,);
}
