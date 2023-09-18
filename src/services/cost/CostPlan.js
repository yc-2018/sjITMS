/*
 * @Author: Liaorongchang
 * @Date: 2023-07-26 14:59:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-14 17:45:18
 * @version: 1.0
 */
import request from '@/utils/request';

export async function getPlanInfo(uuid, payload) {
  return request(`/itms-cost/itms-cost/costplan/getPlanInfo/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateNote(uuid, note) {
  const payload = {
    note: note,
  };
  return request(`/itms-cost/itms-cost/costplan/updateNote/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}
//方案状态变更申请
export async function apply(uuid, payload) {
  return request(`/itms-cost/itms-cost/costPlanApply/apply/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}
//方案状态变更申请审核
export async function audit(uuid) {
  return request(`/itms-cost/itms-cost/costPlanApply/audit?uuid=${uuid}`, {
    method: 'POST',
  });
}
//方案状态变更申请作废
export async function aborted(uuid) {
  return request(`/itms-cost/itms-cost/costPlanApply/aborted?uuid=${uuid}`, {
    method: 'POST',
  });
}

//获取方案配置信息
export async function getConfigInfo(planUuid) {
  return request(`/itms-cost/itms-cost/costPlanConfig/getConfigInfo?planUuid=${planUuid}`, {
    method: 'GET',
  });
}

//修改方案配置
export async function updateConfigInfo(payload) {
  return request(`/itms-cost/itms-cost/costPlanConfig/updateConfigInfo`, {
    method: 'POST',
    body: payload,
  });
}
