/*
 * @Author: Liaorongchang
 * @Date: 2022-04-18 16:49:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-03 15:01:27
 * @version: 1.0
 */
import request from '@/utils/request';

export async function confirm(payload) {
  return request(`/itms-schedule/itms-schedule/sj/receipt/confirm`, {
    method: 'POST',
    body: payload,
  });
}

export async function cancelReceipted(payload) {
  return request(`/itms-schedule/itms-schedule/sj/receipt/cancelReceipted`, {
    method: 'POST',
    body: payload,
  });
}
