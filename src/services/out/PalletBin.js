import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany,loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-facility/facility/palletbin/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryIdleAndThisPostionUseing(payload) {
  return request(`/iwms-facility/facility/palletbin/queryIdleAndThisPostionUseing`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/palletbin`, {
    method: 'POST',
    body: payload,
  },true);
}

export async function get(payload) {
  const companyUuid = loginCompany().uuid;
  const dcUuid = loginOrg().uuid;
  return request(`/iwms-facility/facility/palletbin/${payload.barcode}?companyUuid=${companyUuid}&dcUuid=${dcUuid}`);
}

export async function getPalletBinArts(payload) {
  const companyUuid = loginCompany().uuid;
  const dcUuid = loginOrg().uuid;
  return request(`/iwms-facility/facility/palletbin/getPalletBinArts?palletbinBarcode=${payload.barcode}&companyUuid=${companyUuid}&dcUuid=${dcUuid}`);
}
