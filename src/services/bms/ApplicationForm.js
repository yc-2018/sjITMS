import request from '@/utils/request';

export async function getApplicationSelect(planUuid, month) {
  return request(`/itms-cost/itms-cost/applicationForm/getApplicationSelect/${planUuid}/${month}`, {
    method: 'GET',
  });
}
