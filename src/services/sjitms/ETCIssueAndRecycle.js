/*
 * @Author: Liaorongchang
 * @Date: 2022-09-27 09:50:55
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-28 09:25:54
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
//刷卡
export async function recommend(billNumber) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/recommend?billNumber=${billNumber}&companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}

export async function issue(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/issue?companyUuid=${loginCompany().uuid}&dcUuid=${
      loginOrg().uuid
    }`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function recycle(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/recycle?companyUuid=${loginCompany().uuid}&dcUuid=${
      loginOrg().uuid
    }`,
    {
      method: 'POST',
      body: payload,
    }
  );
}
