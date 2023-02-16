import request from '@/utils/request';

export async function queryDataByOpen(payload) {
  return request(`/itms-schedule/itms-schedule/openapi/quick/getData/${payload.quickuuid}/tms`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryCreateConfigByOpen(payload) {
  return request(`/itms-schedule/itms-schedule/openapi/quick/getOnlFormInfoByCode/${payload}`, {
    method: 'POST',
  });
}

export async function queryColumnsByOpen(payload) {
  return request(`/itms-schedule/itms-schedule/openapi/quick/getColumns`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryAllDataByOpen(payload) {
  return request(`/itms-schedule/itms-schedule/openapi/quick/getAllData/${payload.quickuuid}`, {
    method: 'POST',
    body: payload,
  });
}
