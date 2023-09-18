/*
 * @Author: Liaorongchang
 * @Date: 2023-09-13 17:33:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-13 17:35:03
 * @version: 1.0
 */
import request from '@/utils/request';

export async function batchImport(payload) {
  return request(`/itms-cost/itms-cost/costSubsidy/batchImport?fileKey=${payload.fileKey}`, {
    method: 'POST',
  });
}
