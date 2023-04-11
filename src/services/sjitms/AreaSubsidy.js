/*
 * @Author: Liaorongchang
 * @Date: 2022-10-22 08:57:05
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-11 10:11:36
 * @version: 1.0
 */
import request from '@/utils/request';

export async function onSave(payload) {
  return request(`/itms-schedule/itms-schedule/sj/areaSubsidy/onSave?uuid=${payload.headUuid}`, {
    method: 'POST',
    body: payload.storeUuid,
  });
}

export async function deleteDtl(payload) {
  return request(`/itms-schedule/itms-schedule/sj/areaSubsidy/deleteDtl`, {
    method: 'POST',
    body: payload,
  });
}

export async function bak(validityPeriod, name) {
  return request(
    `/itms-schedule/itms-schedule/sj/areaSubsidy/bak?validityPeriod=${validityPeriod}&name=${name}`,
    {
      method: 'POST',
    }
  );
}
