/*
 * @Author: Liaorongchang
 * @Date: 2022-09-08 11:45:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-18 15:23:12
 * @version: 1.0
 */
import request from '@/utils/request';

export async function handleBill(payload, operation, fieldsValue) {
  return request(
    `/itms-schedule/itms-schedule/sj/tollFee/handleBill?operation=${operation}&note=${fieldsValue}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function handleConfirm(payload) {
  return request(`/itms-schedule/itms-schedule/sj/tollFee/handleConfirm`, {
    method: 'POST',
    body: payload,
  });
}
