import request from '@/utils/request';

export async function createOrg(params) {
  return request(`/itms-schedule/itms-schedule/sj/owner/createOrg?uuid=${params}`, {
    method: 'POST',
    body: params,
  });
}
