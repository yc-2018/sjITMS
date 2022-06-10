/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 11:29:27
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-10 11:51:10
 * @version: 1.0
 */
import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

export async function calculatePlan(payload) {
  return request(
    `/itms-cost/itms-cost/costbill/calculatePlan?uuid=${payload.uuid}&month=${payload.month}`,
    {
      method: 'POST',
    }
  );
}
