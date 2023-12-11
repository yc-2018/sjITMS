/*
 * @Author: Liaorongchang
 * @Date: 2023-09-13 17:33:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-30 18:03:50
 * @version: 1.0
 */
import request from '@/utils/request';

export async function batchImport(payload) {
  return request(`/bms-cost/bms-cost/costSubsidy/batchImport?fileKey=${payload.fileKey}`, {
    method: 'POST',
  });
}

export async function audit(uuid) {
  return request(`/bms-cost/bms-cost/costSubsidy/audit?uuid=${uuid}`, {
    method: 'POST',
  });
}

export async function invalid(uuid) {
  return request(`/bms-cost/bms-cost/costSubsidy/invalid?uuid=${uuid}`, {
    method: 'POST',
  });
}

export async function cancel(uuid) {
  return request(`/bms-cost/bms-cost/costSubsidy/cancel?uuid=${uuid}`, {
    method: 'POST',
  });
}

export async function batchAllAudit(searchKeyValues) {
  return request(`/bms-cost/bms-cost/costSubsidy/batchAllAudit`, {
    method: 'POST',
    body: searchKeyValues,
  });
}
