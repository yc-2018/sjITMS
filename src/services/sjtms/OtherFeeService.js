/*
 * @Author: Liaorongchang
 * @Date: 2022-06-11 14:44:28
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-21 09:09:47
 * @version: 1.0
 */
import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

export async function query(payload) {
  return request(
    `/itms-schedule/itms-schedule/newoperation/dispatchreturn/queryDispatchReturnFee`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/${payload}`, {
    method: 'POST',
  });
}
export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/feetype`, {
    method: 'POST',
    body: payload,
  });
}

export async function getFeeType(payload) {
  return request(`/itms-schedule/itms-schedule/newfeetype/getFeeInfo`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOrUpdateFee(payload) {
  return request(`/itms-schedule/itms-schedule/schedulefee/saveOrUpdate`, {
    method: 'POST',
    body: payload,
  });
}
export async function deleteFee(payload) {
  return request(`/itms-schedule/itms-schedule/schedulefee/deleteFee`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateFee(payload) {
  return request(`/itms-schedule/itms-schedule/schedulefee/update`, {
    method: 'POST',
    body: payload,
  });
}

export async function submitFee(payload) {
  return request(
    `/itms-schedule/itms-schedule/newoperation/dispatchreturn/submitFee?billNumber=${payload}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}
