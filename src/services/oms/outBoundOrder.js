import request from '@/utils/request';

export async function audited(payload) {
  return request(`/oms-owner/oms-owner/outBoundOrder/audited?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function canceled(payload) {
  return request(`/oms-owner/oms-owner/outBoundOrder/cancel?uuid=${payload}`, {
    method: 'POST',
  });
}