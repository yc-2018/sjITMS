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

export async function updateFee(payload) {
  return request(`/itms-schedule/itms-schedule/schedulefee/update`, {
    method: 'POST',
    body: payload,
  });
}
