/*
 * @Author: Liaorongchang
 * @Date: 2022-10-15 14:13:22
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-16 20:04:31
 * @version: 1.0
 */
import request from '@/utils/request';

export async function onSave(payload) {
  return request(`/itms-schedule/itms-schedule/sj/storeTeam/onSave?headUuid=${payload.headUuid}`, {
    method: 'POST',
    body: payload.storeUuid,
  });
}

export async function saveTableSort(payload) {
  return request(`/itms-schedule/itms-schedule/sj/storeTeam/saveTableSort`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteDtl(payload) {
  return request(`/itms-schedule/itms-schedule/sj/storeTeam/deleteDtl`, {
    method: 'POST',
    body: payload,
  });
}
