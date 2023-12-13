/*
 * @Author: Liaorongchang
 * @Date: 2023-07-20 11:23:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-31 10:27:06
 * @version: 1.0
 */
import request from '@/utils/request';

export async function getApplicationSelect(planUuid, month) {
  return request(`/bms-cost/bms-cost/applicationForm/getApplicationSelect/${planUuid}/${month}`, {
    method: 'GET',
  });
}
