/*
 * @Author: Liaorongchang
 * @Date: 2021-12-22 14:41:54
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-29 16:49:20
 * @version: 1.0
 */
import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-account/account/role/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-account/account/role`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-account/account/role/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-account/account/role/${payload.uuid}`, {
    method: 'POST',
  });
}

export async function enable(payload) {
  return request(`/iwms-account/account/role/${payload.uuid}/enable`, {
    method: 'POST',
  });
}

export async function disable(payload) {
  return request(`/iwms-account/account/role/${payload.uuid}/disable`, {
    method: 'POST',
  });
}

export async function authorize(payload) {
  return request(
    `/iwms-account/account/role/${payload.uuid}/authorize?orgType=${payload.orgType}`,
    {
      method: 'POST',
      body: payload.resourceKeys,
    }
  );
}

export async function getResources(uuid) {
  return request(`/iwms-account/account/role/${uuid}/resource`);
}

export async function getByOrgUuid() {
  return request(`/iwms-account/account/role/getByOrgUuid?orgUuid=${loginOrg().uuid}`);
}

export async function get(uuid) {
  return request(`/iwms-account/account/role/${uuid}`);
}

export async function addUser(payload) {
  return request(`/iwms-account/account/role/${payload.uuid}/user?userUuids=${payload.userUuids}`, {
    method: 'POST',
  });
}

export async function removeUser(payload) {
  return request(`/iwms-account/account/role/${payload.uuid}/user/${payload.userUuid}`, {
    method: 'POST',
  });
}
