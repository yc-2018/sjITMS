/*
 * @Author: Liaorongchang
 * @Date: 2023-07-26 14:59:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-31 10:20:51
 * @version: 1.0
 */
import request from '@/utils/request';

//新
export async function getPlanInfo(uuid, payload) {
  return request(`/bms-cost/bms-cost/costplan/getPlanInfo/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}
//新
export async function updateNote(uuid, note) {
  const payload = {
    note: note,
  };
  return request(`/bms-cost/bms-cost/costplan/updateNote/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}
//方案状态变更申请
export async function apply(uuid, payload) {
  return request(`/bms-cost/bms-cost/costPlanApply/apply/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}
//方案状态变更申请审核
export async function audit(uuid) {
  return request(`/bms-cost/bms-cost/costPlanApply/audit?uuid=${uuid}`, {
    method: 'POST',
  });
}
//方案状态变更申请作废
export async function aborted(uuid) {
  return request(`/bms-cost/bms-cost/costPlanApply/aborted?uuid=${uuid}`, {
    method: 'POST',
  });
}

//获取方案配置信息
export async function getConfigInfo(planUuid) {
  return request(`/bms-cost/bms-cost/costPlanConfig/getConfigInfo?planUuid=${planUuid}`, {
    method: 'GET',
  });
}

//修改方案配置
export async function updateConfigInfo(payload) {
  return request(`/bms-cost/bms-cost/costPlanConfig/updateConfigInfo`, {
    method: 'POST',
    body: payload,
  });
}
