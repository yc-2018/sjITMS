import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

export async function getBycompanyUuidAndDcUuid(payload) {
  return request(`/iwms-facility/facility/dailyKnots/query?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}


export async function modify(payload) {
  return request(`/iwms-facility/facility/dailyKnots/modify`, {
    method: 'POST',
    body:payload
  });
}

export async function queryLog(payload) {
  return request(`/iwms-facility/facility/dailyKnots/page`, {
    method: 'POST',
    body:payload
  });
}
