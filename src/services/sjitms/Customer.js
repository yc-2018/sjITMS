/*
 * @Author: guankongjin
 * @Date: 2022-12-20 08:59:27
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-07 08:44:32
 * @Description: 客服工单接口
 * @FilePath: \iwms-web\src\services\sjitms\Customer.js
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function release(billUuid, param) {
  return request(`/itms-schedule/itms-schedule/sj/bill/customer/release?uuid=${billUuid}`, {
    method: 'POST',
    body: param,
  });
}
export async function finished(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/customer/finished?uuid=${billUuid}`, {
    method: 'POST',
  });
}
export async function unFinished(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/customer/unFinished?uuid=${billUuid}`, {
    method: 'POST',
  });
}

export async function norm(billUuid, norm) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/customer/norm?uuid=${billUuid}&norm=${norm}`,
    {
      method: 'POST',
    }
  );
}
export async function batchImport(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/customer/batchimport?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`,
    {
      method: 'POST',
    }
  );
}
