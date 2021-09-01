import request from '@/utils/request';

export async function modify(payload) {
  return request(`/iwms-account/account/billConfig/modify`, {
    method: 'POST',
    body: payload,
  });
}


export async function get1() {
  return request(`/iwms-account/account/billConfig/query`);
}

