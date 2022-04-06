/*
 * @Author: Liaorongchang
 * @Date: 2022-03-12 16:08:35
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-04 16:12:07
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

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
