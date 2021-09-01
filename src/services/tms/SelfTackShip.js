import request from '@/utils/request';

export async function queryAlcntc(payload) {
  return request(`/iwms-facility/facility/selfhandover/queryAlcntc`, {
    method: 'POST',
    body: payload
  });
}

export async function queryContainer(payload) {
  return request(`/iwms-facility/facility/selfhandover/queryContainer`, {
    method: 'POST',
    body: payload
  });
}

export async function confirmSelfHandoverAlcNtc(payload) {
  return request(`/iwms-facility/facility/selfhandover/confirmSelfHandoverAlcNtc`, {
    method: 'POST',
    body: payload
  });
}

export async function confirmSelfHandoverContainer(payload) {
  return request(`/iwms-facility/facility/selfhandover/confirmSelfHandoverContainer`, {
    method: 'POST',
    body: payload
  });
}
