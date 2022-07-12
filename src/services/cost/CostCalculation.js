/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 11:29:27
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-12 15:07:28
 * @version: 1.0
 */
import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

export async function calculatePlan(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/calculatePlan?planUuid=${payload.planUuid}&month=${
      payload.month
    }`,
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
  return request(`/itms-cost/itms-cost/costbill/haveCheck?Uuid=${Uuid}`, {
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
    `/itms-cost/itms-cost/costbill/getSubjectBill?billUuid=${payload.billUuid}&subjectUuid=${
      payload.subjectUuid
    }`,
    {
      method: 'GET',
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
