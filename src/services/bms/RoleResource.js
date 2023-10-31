/*
 * @Author: Liaorongchang
 * @Date: 2023-08-29 10:20:42
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-29 17:36:48
 * @version: 1.0
 */
import request from '@/utils/request';

export async function costAuthorize(uuid, ftype, payload) {
  return request(`/iwms-account/account/role/${uuid}/costAuthorize?ftype=${ftype}`, {
    method: 'POST',
    body: payload,
  });
}

export async function getCostRoleResource(uuid, ftype) {
  return request(`/iwms-account/account/role/${uuid}/getCostRoleResource?ftype=${ftype}`, {
    method: 'GET',
  });
}
