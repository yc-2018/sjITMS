/*
 * @Author: qiuhui
 * @Date: 2023-05-19 10:28:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-27 16:47:39
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function recycle(params) {
  return request(
    `/itms-schedule/itms-schedule/issue/recycle`,
    {
      method: 'POST',
      body: params,
    }
  );
}
export async function audits(params) {
  return request(`/itms-schedule/itms-schedule/issue/audits`, {
    method: 'POST',
    body: params,
  });
}

export async function cancellation(params) {
  return request(`/itms-schedule/itms-schedule/issue/cancellation`, {
    method: 'POST',
    body: params,
  });
}

