/*
 * @Author: guankongjin
 * @Date: 2022-07-13 10:25:32
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-07-13 16:34:52
 * @Description: file content
 * @FilePath: \iwms-web\src\services\sjitms\ScheduleProcess.js
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
//刷卡
export async function swipe(empId) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/swipe?empId=${empId}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}
//装车开始
export async function shipping(billNumber, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/shipping?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}
//装车结束
export async function shiped(billNumber, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/shiped?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}

//发运
export async function depart(billNumber, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/depart?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}

//回厂
export async function back(billNumber, version, returnMileage) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/back?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}&returnMileage=${returnMileage}`,
    {
      method: 'POST',
    }
  );
}