import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/itms-schedule/itms-schedule/receipt/page`, {
    method: 'POST',
    body: payload
  });
}

export async function pageHistory(payload){
  return request(`/itms-schedule/itms-schedule/receipt/pageHistory`, {
    method: 'POST',
    body: payload
  });
}

export async function confirm(payload) {
  return request(`/itms-schedule/itms-schedule/receipt/confirm`, {
    method: 'POST',
    body: payload
  });
}