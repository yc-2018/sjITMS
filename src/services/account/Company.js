import { stringify } from 'qs';
import request from '@/utils/request';

export async function query(payload) {
  return request(`/iwms-account/account/company/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-account/account/company`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-account/account/company/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function enable(payload) {
  return request(`/iwms-account/account/company/${payload.uuid}/enable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function disable(payload) {
  return request(`/iwms-account/account/company/${payload.uuid}/disable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function authorize(payload) {
  return request(`/iwms-account/account/company/${payload.uuid}/authorize?version=${payload.version}&validDate=${payload.validDate}`, {
    method: 'POST',
    body: payload.resources
  });
}

export async function get(uuid) {
  return request(`/iwms-account/account/company/${uuid}`);
}

export async function getByUuid32(uuid32) {
  return request(`/iwms-account/account/company/${uuid32}/uuid32`);
}

export async function getByCode(code) {
  return request(`/iwms-account/account/company/${code}/code`);
}

export async function getResourceKeys(uuid) {
  return request(`/iwms-account/account/company/${uuid}/resourceKeys`);
}

export async function getResources(uuid) {
  return request(`/iwms-account/account/company/${uuid}/resources`);
}

export async function saveAndAuthorize(payload){
  return request(`/iwms-account/account/company/saveAndAuthorize`, {
    method: 'POST',
    body: payload,
  });
}