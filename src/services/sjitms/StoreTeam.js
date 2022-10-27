/*
 * @Author: Liaorongchang
 * @Date: 2022-10-15 14:13:22
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-10-24 16:51:27
 * @version: 1.0
 */
import request from '@/utils/request';

//获取门店列表
export async function getAddressByUuids(payload) {
  return request(`/itms-schedule/itms-schedule/sj/storeTeam/getAddressByUuids`, {
    method: 'POST',
    body: payload,
  });
}

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
