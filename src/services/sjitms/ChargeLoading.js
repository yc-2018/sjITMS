/*
 * @Author: Liaorongchang
 * @Date: 2022-03-30 15:20:52
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-04 09:16:40
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

export async function beginloading(payload) {
  return request(`/itms-schedule/itms-schedule/sjbeginloading?scheduleBillUuid=${payload}`, {
    method: 'POST',
  });
}

export async function finishloading(payload) {
  return request(`/itms-schedule/itms-schedule/sjfinishloading?scheduleBillUuid=${payload}`, {
    method: 'POST',
  });
}
