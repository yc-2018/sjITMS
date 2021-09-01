import request from '@/utils/request';
import { stringify } from 'qs';
import { loginOrg } from '@/utils/LoginContext';
export async function saveOrModify(payload) {
  return request(`/iwms-facility/facility/printerconfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByDcUuid() {
  return request(`/iwms-facility/facility/printerconfig/getByDcUuid?dcUuid=${loginOrg().uuid}`);
}