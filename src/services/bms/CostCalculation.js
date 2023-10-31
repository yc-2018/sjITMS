/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 11:29:27
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-31 09:22:11
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';

//新费用计算过程
export async function newCalculatePlan(payload) {
  return request(
    `/bms-cost/bms-cost/newCostBill/calculatePlan?planUuid=${payload.planUuid}&month=${
      payload.month
    }&code=${loginUser().code}`,
    {
      method: 'POST',
    }
  );
}

export async function calculateMemberWage(payload) {
  return request(
    `/bms-cost/bms-cost/costbill/calculateMemberWage?scheduleNum=${payload}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}
//混
export async function getBill(planUuid, payload) {
  return request(`/bms-cost/bms-cost/costbill/getBill?planUuid=${planUuid}`, {
    method: 'POST',
    body: payload,
  });
}

//混
export async function getBillLogs(billUuid, payload) {
  return request(`/bms-cost/bms-cost/costbill/getBillLogs?billUuid=${billUuid}`, {
    method: 'POST',
    body: payload,
  });
}
//混
export async function findCostFormFieldByPlanUuid(planUuid) {
  return request(`/bms-cost/bms-cost/source/findCostFormFieldByPlanUuid?planUuid=${planUuid}`, {
    method: 'POST',
  });
}

//混
export async function getSubjectBill(payload) {
  return request(`/bms-cost/bms-cost/costbill/getSubjectBill?billUuid=${payload.billUuid}`, {
    method: 'POST',
    body: payload.subjectUuid,
  });
}
//混
export async function updateSubjectBill(payload) {
  return request(
    `/bms-cost/bms-cost/costbill/updateSubjectBill?billUuid=${payload.billUuid}&subjectUuid=${
      payload.subjectUuid
    }`,
    {
      method: 'POST',
      body: payload.updateMap,
    }
  );
}
//混
export async function getSource(payload) {
  return request(
    `/bms-cost/bms-cost/costbill/getSource?projectUuid=${payload.projectUuid}&page=${
      payload.page
    }&pageSize=${payload.pageSize}`,
    {
      method: 'GET',
    }
  );
}

//混
export async function getPlanParticulars(subjectUuid, billuuid, name) {
  return request(`/bms-cost/bms-cost/costbill/getPlanParticulars/${billuuid}/${name}`, {
    method: 'POST',
    body: subjectUuid,
  });
}
//混
export async function UpdateDtlNote(payload) {
  return request(`/bms-cost/bms-cost/costbill/UpdateDtlNote`, {
    method: 'POST',
    body: payload,
  });
}
//混
export async function exportPlan(billuuid, subjectUuid) {
  return request(`/bms-cost/bms-cost/costplan/exportPlan/${billuuid}/${subjectUuid}`, {
    method: 'GET',
  });
}
