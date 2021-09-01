import { stringify } from 'qs';
import request from '@/utils/request';
import { loginUser, loginOrg } from '@/utils/LoginContext';

export async function getUrl(uuid) {
  return request(`/iwms-account/account/report/url?uuid=${uuid}`);
}

export async function getReportMenu() {
  return request(`/iwms-account/account/report/query/${loginUser().uuid}/web?orgUuid=${loginOrg().uuid}`);
}

export async function queryMenu() {
  return request(`/iwms-account/account/report/all?orgUuid=${loginOrg().uuid}`);
}

export async function add(params) {
  return request(`/iwms-account/account/report`, {
    method: 'POST',
    body: params,
  });
}

export async function update(params) {
  return request(`/iwms-account/account/report/update`, {
    method: 'POST',
    body: params,
  });
}

export async function get(payload) {
  return request(`/iwms-account/account/report/${payload.uuid}`);
}

export async function remove(uuid) {
  return request(`/iwms-account/account/report/${uuid}`, {
    method: 'POST'
  });
}

export async function changeOrder(payload) {
  return request(`/iwms-account/account/report/order/${payload.uuid}?dir=${payload.dir}`, {
    method: 'POST'
  });
}