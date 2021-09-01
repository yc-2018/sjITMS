
import request from '@/utils/request';
import { loginOrg,loginCompany,loginUser } from '@/utils/LoginContext';

export async function collect(payload) {
  return request(`/iwms-account/account/rf/collect?module=${payload.module}&orgId=${loginOrg().uuid}&userId=${loginUser().uuid}`, {
    method: 'POST',
  });
}

export async function cancelcollect(payload) {
  return request(`/iwms-account/account/rf/cancelcollect?module=${payload.module}&orgId=${loginOrg().uuid}&userId=${loginUser().uuid}`, {
    method: 'POST',
  });
}


export async function queryCollection(payload) {
  return request(`/iwms-account/account/rf/queryCollection?orgId=${payload.orgId}&userId=${payload.userId}`, {
    method: 'GET',
  });
}