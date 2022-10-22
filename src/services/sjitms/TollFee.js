/*
 * @Author: Liaorongchang
 * @Date: 2022-09-08 11:45:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-22 10:53:00
 * @version: 1.0
 */
import request from '@/utils/request';

export async function approvedOrRejected(payload, operation) {
  return request(
    `/itms-schedule/itms-schedule/sj/tollFee/approvedOrRejected?operation=${operation}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}
