/*
 * @Author: Liaorongchang
 * @Date: 2022-03-30 15:20:52
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-25 15:55:44
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function getByCarrier(payload) {
  return request(
    `/itms-schedule/itms-schedule/getunshipedbillbydrivercode?companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}&driverCode=${payload}`,
    {
      method: 'GET',
    }
  );
}

export async function beginloading(uuid, version) {
  return request(`/itms-schedule/itms-schedule/sjbeginloading?uuid=${uuid}&version=${version}`, {
    method: 'POST',
  });
}

export async function finishloading(uuid, version) {
  return request(`/itms-schedule/itms-schedule/sjfinishloading?uuid=${uuid}&version=${version}`, {
    method: 'POST',
  });
}
