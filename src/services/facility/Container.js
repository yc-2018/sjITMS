import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany,loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-facility/facility/container/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryIdleAndThisPostionUseing(payload) {
  return request(`/iwms-facility/facility/container/queryIdleAndThisPostionUseing`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/container`, {
    method: 'POST',
    body: payload,
  },true);
}

export async function get(payload) {
  const companyUuid = loginCompany().uuid;
  const dcUuid = loginOrg().uuid;
  return request(`/iwms-facility/facility/container/${payload.barcode}?companyUuid=${companyUuid}&dcUuid=${dcUuid}`);
}

export async function getContainerArts(payload) {
  const companyUuid = loginCompany().uuid;
  const dcUuid = loginOrg().uuid;
  return request(`/iwms-facility/facility/container/getContainerArts?containerBarcode=${payload.barcode}&companyUuid=${companyUuid}&dcUuid=${dcUuid}`);
}
