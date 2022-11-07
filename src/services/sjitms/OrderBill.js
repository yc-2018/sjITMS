/*
 * @Author: Liaorongchang
 * @Date: 2022-03-12 16:08:35
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-04 10:21:44
 * @version: 1.0
 */
import request from '@/utils/request';
import fetch from 'dva/fetch';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

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
export async function queryDriverRoutes(origin, destination, waypoints) {
  return Promise.race([
    fetch(
      `/bmapapi/direction/v2/driving?origin=${origin}&destination=${destination}&waypoints=${waypoints}&alternatives=1&intelligent_plan=1&ak=DcXGLWmzGcdU8GLzuiYtmhhtdVCjffty`
    ),
  ]).then(response => {
    return response.json();
  });
}
export async function queryAuditedOrder(params) {
  return request(`/itms-schedule/itms-schedule/sj/bill/ordertms/queryAuditedOrder`, {
    method: 'POST',
    body: params,
  });
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
//待定运输订单
export async function savePending(uuids) {
  return request(`/itms-schedule/itms-schedule/sj/bill/ordertms/savePending`, {
    method: 'POST',
    body: uuids,
  });
}
//删除待定运输订单
export async function removePending(uuids) {
  return request(`/itms-schedule/itms-schedule/sj/bill/ordertms/removePending`, {
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

export async function batchAudit(searchKeyValues) {
  return request(`/itms-schedule/itms-schedule/sj/bill/ordertms/batchAudit`, {
    method: 'POST',
    body: searchKeyValues,
  });
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
