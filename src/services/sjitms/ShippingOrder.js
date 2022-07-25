/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 17:23:09
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-25 17:02:16
 * @version: 1.0
 */
import request from '@/utils/request';

export async function audit(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/shippingOder/audited?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function batchImport(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/shippingOder/batchimport?fileKey=${payload.fileKey}`,
    {
      method: 'POST',
    }
  );
}
