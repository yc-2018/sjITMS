/*
 * @Author: guankongjin
 * @Date: 2022-12-20 08:59:27
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-03 16:55:27
 * @Description: 客服工单接口
 * @FilePath: \iwms-web\src\services\sjitms\Customer.js
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function release(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/customer/release?uuid=${billUuid}`, {
    method: 'POST',
  });
}
export async function finished(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/customer/finished?uuid=${billUuid}`, {
    method: 'POST',
  });
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
