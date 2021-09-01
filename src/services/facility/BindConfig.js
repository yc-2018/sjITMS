import request from '@/utils/request';

export async function query(payload) {
  return request(`/iwms-facility/facility/binUsageConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

