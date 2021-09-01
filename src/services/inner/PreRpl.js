import request from '@/utils/request';
export async function execute(payload) {
  return request(`/iwms-facility/facility/preRpl/execute`, {
    method: 'POST',
    body: payload,
  },true);
}

export async function getSchedule(traceId) {
  return request(`/iwms-facility/facility/preRpl/${traceId}/schedule`);
}