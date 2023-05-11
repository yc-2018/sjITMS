import request from '@/utils/request';

export async function audited(payload) {
  return request(`/oms-owner/oms-owner/warehousingOrder/audited?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function canceled(payload) {
  return request(`/oms-owner/oms-owner/warehousingOrder/cancel?uuid=${payload}`, {
    method: 'POST',
  });
}