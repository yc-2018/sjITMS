/*
 * @Author: Liaorongchang
 * @Date: 2023-05-09 09:58:31
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-05-09 14:59:28
 * @version: 1.0
 */
import request from '@/utils/request';

export async function audited(payload) {
  return request(`/oms-owner/oms-owner/vendorRtn/audited?uuid=${payload}`, {
    method: 'POST',
  });
}
