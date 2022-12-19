/*
 * @Author: Liaorongchang
 * @Date: 2022-03-12 16:08:35
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 17:45:46
 * @version: 1.0
 */
import request from '@/utils/request';
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
export async function getOrderCount() {
  return request(
    `/itms-schedule/itms-schedule/statistical/getOrderCount/${loginCompany().uuid}/${loginOrg().uuid}`,
    {
      method: 'GET',
      headers:{check_flag:false}
    }
  );

}
export async function getVehicleCount() {
    return request(
      `/itms-schedule/itms-schedule/statistical/getVehicleCount/${loginCompany().uuid}/${loginOrg().uuid}`,
      {
        method: 'GET',
      }
    );
  
  }
  export async function getJobTodayCount() {
    return request(
      `/itms-schedule/itms-schedule/statistical/getJobTodayCount/${loginCompany().uuid}/${loginOrg().uuid}`,
      {
        method: 'GET',
      }
    );
  
  }
  export async function getTodayCompareOrder() {
    return request(
      `/itms-schedule/itms-schedule/statistical/getTodayCompareOrder/${loginCompany().uuid}/${loginOrg().uuid}`,
      {
        method: 'GET',
      }
    );
  
  }

  export async function getCollectbin() {
    return request(
      `/itms-schedule/itms-schedule/statistical/getCollectbin/${loginCompany().uuid}/${loginOrg().uuid}`,
      {
        method: 'GET',
      }
    );
  
  }