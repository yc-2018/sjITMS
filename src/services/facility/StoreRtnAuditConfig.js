import request from '@/utils/request';

export async function save(payload) {
  return request(`/iwms-facility/facility/rtnGenBillStateConfig/save`, {
    method: 'POST',
    body: payload,
  });
}

export async function getBillState(payload) {
  return request(`/iwms-facility/facility/rtnGenBillStateConfig/getBillState?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`);
}
