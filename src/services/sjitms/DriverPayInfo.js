/*
 * @Author: qiuhui
 * @Date: 2023-05-19 10:28:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-27 16:47:39
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function batchImport(payload) {
  return request(
    `/itms-schedule/itms-schedule/driverPayInfo/batchImport?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`,
    {
      method: 'POST',
    }
  );
}
