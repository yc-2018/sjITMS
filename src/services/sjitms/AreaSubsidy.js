/*
 * @Author: Liaorongchang
 * @Date: 2022-10-22 08:57:05
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-03-20 16:50:46
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

export async function bak(beginPeriod,validityPeriod, name) {
  return request(
    `/itms-schedule/itms-schedule/sj/areaSubsidy/bak?beginPeriod=${beginPeriod}&validityPeriod=${validityPeriod}&name=${name}`,
    {
      method: 'POST',
    }
  );
}
