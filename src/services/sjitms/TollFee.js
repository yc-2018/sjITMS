/*
 * @Author: Liaorongchang
 * @Date: 2022-09-08 11:45:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-20 17:15:50
 * @version: 1.0
 */
import request from '@/utils/request';

export async function approved(payload) {
  return request(`/itms-schedule/itms-schedule/sj/tollFee/approved`, {
    method: 'POST',
    body: payload,
  });
}
