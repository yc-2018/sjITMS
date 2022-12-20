/*
 * @Author: guankongjin
 * @Date: 2022-12-20 08:59:27
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-12-20 09:28:13
 * @Description: 客服工单接口
 * @FilePath: \iwms-web\src\services\sjitms\Customer.js
 */
import request from '@/utils/request';

export async function release(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/customer/release?uuid=${billUuid}`, {
    method: 'POST',
  });
}
export async function finished(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/customer/finished?uuid=${billUuid}`, {
    method: 'POST',
  });
}
