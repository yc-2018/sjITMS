/*
 * @Author: Liaorongchang
 * @Date: 2022-09-08 11:45:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-26 15:19:53
 * @version: 1.0
 */
import request from '@/utils/request';

export async function handleBill(payload, operation) {
  return request(`/itms-schedule/itms-schedule/sj/tollFee/handleBill?operation=${operation}`, {
    method: 'POST',
    body: payload,
  });
}
