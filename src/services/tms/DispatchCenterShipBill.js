import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/itms-schedule/itms-schedule/ship/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(uuid) {
  return request(`/itms-schedule/itms-schedule/ship/${uuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/itms-schedule/itms-schedule/ship/getbynumber?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`);
}

export async function updateDispatchTime(payload) {
  return request(`/itms-schedule/itms-schedule/ship/updateDispatchTime?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`,{
    method: 'POST'
  });
}

export async function updateReturnTime(payload) {
  return request(`/itms-schedule/itms-schedule/ship/updateReturnTime?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`,{
    method: 'POST'
  });
}
