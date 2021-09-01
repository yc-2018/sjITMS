import request from '@/utils/request';

export async function queryEntityLog(payload) {
  return request(`/iwms-account/account/logger/entityLog/page`, {
    method: 'POST',
    body: payload,
  });
}