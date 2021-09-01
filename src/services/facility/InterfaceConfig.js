import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

export async function query(payload) {
  return request(`/iwms-facility/facility/interfaceconfig/query?orgId=${payload.orgId}`, {
    method: 'GET',
  });
}

export async function openOrClose(payload) {
  return request(`/iwms-facility/facility/interfaceconfig/openOrClose`, {
    method: 'POST',
    body:payload
  });
}

export async function queryLog(payload) {
  return request(`/iwms-facility/facility/interfaceconfig/queryLog`, {
    method: 'POST',
    body:payload
  });
}


