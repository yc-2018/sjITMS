/*
 * @Author: Liaorongchang
 * @Date: 2023-07-26 14:59:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-22 09:15:43
 * @version: 1.0
 */
import request from '@/utils/request';

export async function getPlanInfo(uuid) {
  return request(`/itms-cost/itms-cost/costplan/getPlanInfo/${uuid}`, {
    method: 'GET',
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

export async function apply(uuid,payload) {
  return request(`/itms-cost/itms-cost/costPlanApply/apply/${uuid}`, {
    method: 'POST',
    body:payload
  });
}
