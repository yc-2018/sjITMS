/*
 * @Author: Liaorongchang
 * @Date: 2023-11-01 15:58:33
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-12-29 09:52:43
 * @version: 1.0
 */
import request from '@/utils/request';

export async function batchImport(payload) {
  return request(`/bms-cost/bms-cost/driverFee/batchImport?fileKey=${payload.fileKey}&portOrg=${payload.portOrg}`, {
    method: 'POST',
  });
}

export async function audit(uuid) {
  return request(`/bms-cost/bms-cost/driverFee/audit?uuid=${uuid}`, {
    method: 'POST',
  });
}

export async function invalid(uuid) {
  return request(`/bms-cost/bms-cost/driverFee/invalid?uuid=${uuid}`, {
    method: 'POST',
  });
}
