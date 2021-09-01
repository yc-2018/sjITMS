import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function saveOrUpdate(payload) {
  return request(`/iwms-facility/facility/putAwayTransferConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByBinCode(payload) {
  return request(`/iwms-facility/facility/putAwayTransferConfig/getByBinCode?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&binCode=${payload}`);
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/putAwayTransferConfig/delete?dcUuid=${loginOrg().uuid}&binCode=${payload.binCode}`);
}

export async function get(payload) {
  return request(`/iwms-facility/facility/putAwayTransferConfig/${payload}`);
}

export async function query(payload) {
  return request(`/iwms-facility/facility/putAwayTransferConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

