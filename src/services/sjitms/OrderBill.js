/*
 * @Author: Liaorongchang
 * @Date: 2022-03-12 16:08:35
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-25 16:54:13
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

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
export async function savePending(uuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/ordertms/savePending?uuid=${uuid}`, {
    method: 'POST',
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
