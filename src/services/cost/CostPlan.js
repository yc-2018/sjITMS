import request from '@/utils/request';

export async function getPlanInfo(uuid) {
  return request(`/itms-cost/itms-cost/costplan/getPlanInfo/${uuid}`, {
    method: 'GET',
  });
}
