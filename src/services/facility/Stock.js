import {stringify} from 'qs';
import request from '@/utils/request';
import {loginCompany} from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-facility/facility/stock/stocks`, {
  method: 'POST',
  body: payload,
  });
}