import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/save`, {
    method: 'POST',
    body: payload,
  });
}
