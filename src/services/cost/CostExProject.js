/*
 * @Author: Liaorongchang
 * @Date: 2023-09-13 17:33:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-18 17:51:27
 * @version: 1.0
 */
import request from '@/utils/request';

export async function batchImport(payload) {
  return request(`/itms-cost/itms-cost/costSubsidy/batchImport?fileKey=${payload.fileKey}`, {
    method: 'POST',
  });
}

export async function audit(uuid) {
  return request(`/itms-cost/itms-cost/costSubsidy/audit?uuid=${uuid}`, {
    method: 'POST',
  });
}

export async function invalid(uuid) {
  return request(`/itms-cost/itms-cost/costSubsidy/invalid?uuid=${uuid}`, {
    method: 'POST',
  });
}

export async function cancel(uuid) {
  return request(`/itms-cost/itms-cost/costSubsidy/cancel?uuid=${uuid}`, {
    method: 'POST',
  });
}
