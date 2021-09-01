import request from '@/utils/request';

export async function modify(payload) {
  return request(`/iwms-account/account/dailyKnotConfig/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function get() {
  return request(`/iwms-account/account/dailyKnotConfig/query`);
}

