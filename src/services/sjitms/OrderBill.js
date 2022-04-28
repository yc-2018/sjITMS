/*
 * @Author: Liaorongchang
 * @Date: 2022-03-12 16:08:35
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-28 09:37:15
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

export async function getAuditedOrder(searchKeyValues) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/ordertms/getAuditedOrder?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
      body: searchKeyValues,
    }
  );
}

export async function getOrderByStat(stat) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/ordertms/getOrderByStat?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}&stat=${stat}`,
    {
      method: 'GET',
    }
  );
}

export async function getOrderInPending() {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/ordertms/getOrderInPending?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}`,
    {
      method: 'GET',
    }
  );
}

export async function savePending(uuids) {
  return request(`/itms-schedule/itms-schedule/sj/bill/ordertms/savePending`, {
    method: 'POST',
    body: uuids,
  });
}

export async function batchImport(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/ordertms/batchimport?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`,
    {
      method: 'POST',
    }
  );
}

export async function audit(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/ordertms/audited?companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}&billNumber=${payload}`,
    {
      method: 'POST',
    }
  );
}

export async function cancel(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/ordertms/canceled?companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}&billNumber=${payload}`,
    {
      method: 'POST',
    }
  );
}
