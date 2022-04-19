/*
 * @Author: Liaorongchang
 * @Date: 2022-04-18 16:49:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-19 08:59:26
 * @version: 1.0
 */
import request from '@/utils/request';

export async function confirm(payload) {
  console.log('payload', payload);
  return request(`/itms-schedule/itms-schedule/sj/receipt/confirm`, {
    method: 'POST',
    body: payload,
  });
}
