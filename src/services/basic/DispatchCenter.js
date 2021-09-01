import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/save`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function enable(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/${payload.uuid}/enable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function disable(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/${payload.uuid}/disable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function get(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/get?uuid=${payload.uuid}`);
}

export async function getbycode(payload) {
  const companyUuid = loginCompany().uuid;
  return request(`/iwms-basic/basic/dispatchcenter/getbycode?code=${payload.code}&companyUuid=${companyUuid}`);
}

export async function getByDcUuid(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/getByDcUuid?dcUuid=${payload.dcUuid}`);
}
