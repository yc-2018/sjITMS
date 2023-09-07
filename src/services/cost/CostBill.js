import request from '@/utils/request';

export async function createChildBill(billUuid, payload) {
  return request(`/itms-cost/itms-cost/newCostBill/createChildBill/${billUuid}`, {
    method: 'POST',
    body: payload,
  });
}
