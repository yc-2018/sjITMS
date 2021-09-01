import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/alcntcbillconfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryByDc(payload) {
  return request(`/iwms-facility/facility/alcntcbillconfig/queryByDc?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/alcntcbillconfig/remove?dcUuid=${loginOrg().uuid}&alcntcType=${payload.alcntcType}`, {
    method: 'DELETE',
  });
}