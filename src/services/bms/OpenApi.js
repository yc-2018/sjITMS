import request from '@/utils/request';

export async function queryDataByDbSource(payload) {
  return request(
    `/bms-cost/bms-cost/openApiCost/getData/${payload.quickuuid}/${payload.dbSource}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function queryColumnsByOpen(payload) {
  return request(`/bms-cost/bms-cost/openApiCost/getColumns`, {
    method: 'POST',
    body: payload,
  });
}

//获取子帐单明细
export async function getChildBillInfo(uuid, payload) {
  return request(`/bms-cost/bms-cost/openApiCost/getChildBillInfo/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}
