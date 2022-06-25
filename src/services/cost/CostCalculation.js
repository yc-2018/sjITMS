/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 11:29:27
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-11 14:56:15
 * @version: 1.0
 */
import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

export async function calculatePlan(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/calculatePlan?planUuid=${payload.planUuid}&month=${
      payload.month
    }`,
    {
      method: 'POST',
    }
  );
}

export async function getBill(planUuid,payload) { 
  return request(
    `/itms-cost/itms-cost/costbill/getBill?planUuid=${planUuid}`,
    {
      method: 'POST',
      body:payload
    }
  );
}
export   function findCostFormFieldByPlanUuid(planUuid) { 
  return request(
    `/itms-cost/itms-cost/source/findCostFormFieldByPlanUuid?planUuid=${planUuid}`,
    {
      method: 'POST'
      
    }
  );
}
