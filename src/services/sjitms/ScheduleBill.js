/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:24:22
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-20 17:32:44
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/save`, {
    method: 'POST',
    body: payload,
  });
}

export async function aborted(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/aborted?billUuid=${payload.UUID}&version=${
      payload.FVERSION
    }`,
    {
      method: 'PUT',
    }
  );
}

export async function shipRollback(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/shipRollback?billUuid=${payload.UUID}&version=${
      payload.FVERSION
    }`,
    {
      method: 'PUT',
    }
  );
}

export async function removeCar(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/removeCar`, {
    method: 'POST',
    body: payload,
  });
}
