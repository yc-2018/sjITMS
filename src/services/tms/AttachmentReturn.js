import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
export async function query(params) {
  return request(`/iwms-facility/facility/attreturn/page`, {
    method: 'POST',
    body: params,
  });
}

export async function queryReturns(params) {
  return request(`/iwms-facility/facility/attreturn/queryReturns?companyUuid=${loginCompany().uuid}&storeUuid=${params.storeUuid}`, {
    method: 'GET',
  });
}

export async function modify(params) {
  return request(`/iwms-facility/facility/attreturn/modify`, {
    method: 'POST',
    body: params,
  });
}

export async function remove(params) {
  return request(`/iwms-facility/facility/attreturn/remove?attachmentUuid=${params.attachmentUuid}&companyUuid=${loginCompany().uuid}&storeUuid=${params.storeUuid}`, {
    method: 'DELETE',
  });
}

export async function save (params) {
  return request(`/iwms-facility/facility/attreturn`, {
    method: 'POST',
    body: params,
  });
}

export async function batchSave (params) {
  return request(`/iwms-facility/facility/attreturn/batchSave`, {
    method: 'POST',
    body: params,
  });
} 