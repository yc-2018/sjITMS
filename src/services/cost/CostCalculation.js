/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 11:29:27
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-19 17:06:12
 * @version: 1.0
 */
import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany,loginUser } from '@/utils/LoginContext';

export async function calculatePlan(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/calculatePlan?planUuid=${payload.planUuid}&month=${
      payload.month
    }&code=${loginUser().code}`,
    {
      method: 'POST',
    }
  );
}

//新费用计算过程
export async function newCalculatePlan(payload) {
  return request(
    `/itms-cost/itms-cost/newCostBill/calculatePlan?planUuid=${payload.planUuid}&month=${
      payload.month
    }&code=${loginUser().code}`,
    {
      method: 'POST',
    }
  );
}


export async function calculateMemberWage(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/calculateMemberWage?scheduleNum=${payload}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}

export async function getBill(planUuid, payload) {
  return request(`/itms-cost/itms-cost/costbill/getBill?planUuid=${planUuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function getBillBak(billNumber, payload) {
  return request(`/itms-cost/itms-cost/costbill/getBillBak?billNumber=${billNumber}`, {
    method: 'POST',
    body: payload,
  });
}

export async function getBillLogs(billUuid, payload) {
  return request(`/itms-cost/itms-cost/costbill/getBillLogs?billUuid=${billUuid}`, {
    method: 'POST',
    body: payload,
  });
}
export async function findCostFormFieldByPlanUuid(planUuid) {
  return request(`/itms-cost/itms-cost/source/findCostFormFieldByPlanUuid?planUuid=${planUuid}`, {
    method: 'POST',
  });
}
export async function onLock(planUuid, month) {
  return request(`/itms-cost/itms-cost/costbill/onLock?planUuid=${planUuid}&dateString=${month}`, {
    method: 'GET',
  });
}
export async function isLock(planUuid, month) {
  return request(`/itms-cost/itms-cost/costbill/isLock?planUuid=${planUuid}&dateString=${month}`, {
    method: 'GET',
  });
}

export async function haveCheck(Uuid) {
  return request(`/itms-cost/itms-cost/costbill/haveCheck?Uuid=${Uuid}&operatorcode=${loginUser().code}`, {
    method: 'GET',
  });
}

export async function consumed(Uuid) {
  return request(`/itms-cost/itms-cost/costbill/consumed?Uuid=${Uuid}`, {
    method: 'GET',
  });
}

export async function getSubjectBill(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/getSubjectBill?billUuid=${payload.billUuid}`,
    {
      method: 'POST',
      body:payload.subjectUuid
    }
  );
}

export async function updateSubjectBill(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/updateSubjectBill?billUuid=${payload.billUuid}&subjectUuid=${
      payload.subjectUuid
    }`,
    {
      method: 'POST',
      body: payload.updateMap,
    }
  );
}

export async function getSource(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/getSource?projectUuid=${payload.projectUuid}&page=${
      payload.page
    }&pageSize=${payload.pageSize}`,
    {
      method: 'GET',
    }
  );
}

export async function getCompareBill(billNumber, bakBillNumber, payload) {
  return request(
    `/itms-cost/itms-cost/costbill/compare?billNumber=${billNumber}&bakBillNumber=${bakBillNumber}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}
export async function getPlanParticulars(subjectUuid, billuuid, name) {
  return request(
    `/itms-cost/itms-cost/costbill/getPlanParticulars/${billuuid}/${name}`,
    {
      method: 'POST',
      body:subjectUuid
    }
  );
}

export async function UpdateDtlNote(payload) {
  return request(`/itms-cost/itms-cost/costbill/UpdateDtlNote`, {
    method: 'POST',
    body: payload,
  });
}

export async function exportPlan(billuuid, subjectUuid) {
  return request(`/itms-cost/itms-cost/costplan/exportPlan/${billuuid}/${subjectUuid}`, {
    method: 'GET',
  });
}

export async function uploadFile(file, uuid) {
  return request(`/itms-cost/itms-cost/costbill/uploadFile?uuid=${uuid}`, {
    method: 'POST',
    body: file,
  });
}

export async function deleteFile(uuid, download, index) {
  return request(
    `/itms-cost/itms-cost/costbill/deleteFile?uuid=${uuid}&download=${download}&index=${index}`,
    {
      method: 'POST',
    }
  );
}
