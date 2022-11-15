/*
 * @Author: Liaorongchang
 * @Date: 2022-09-08 11:45:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-15 11:07:15
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
