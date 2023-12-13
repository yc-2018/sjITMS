import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

// 根据来源单号、车牌号、司机工号查询排车单号
export async function queryScheduleNo(payload) {
  return request(`/itms-schedule/itms-schedule/operation/deliveredconfirm/query/scheduleno`, {
    method: 'POST',
    body: payload
  });
}

// 查询可送货确认订单信息
export async function queryOrder(payload) {
  return request(`/itms-schedule/itms-schedule/operation/deliveredconfirm/query/order`, {
    method: 'POST',
    body: payload
  });
}

// 查询可送货确认门店 信息
export async function queryStore(payload) {
  return request(`/itms-schedule/itms-schedule/operation/deliveredconfirm/query/store`, {
    method: 'POST',
    body: payload
  });
}

// 查询未送达确认门店 信息
export async function queryOrderUndelivered(payload) {
  return request(`/itms-schedule/itms-schedule/operation/deliveredconfirm/query/order/undelivered`, {
    method: 'POST',
    body: payload
  });
}

// 订单送货确认
export async function confirmOrder(payload) {
  return request(`/itms-schedule/itms-schedule/newoperation/deliveredconfirm/confirm/order`, {
    method: 'POST',
    body: payload
  });
}


// 门店送货确认
export async function confirmStore(payload) {
  return request(`/itms-schedule/itms-schedule/operation/deliveredconfirm/confirm/store`, {
    method: 'POST',
    body: payload
  });
}

// 门店送货确认
export async function confirmOrderUndelivered(payload) {
  return request(`/itms-schedule/itms-schedule/operation/deliveredconfirm/confirm/order/undelivered`, {
    method: 'POST',
    body: payload
  });
}

// 全部已送达,全部未送达
export async function deliveredConfirmSchedule(payload) {
  return request(`/itms-schedule/itms-schedule/newoperation/deliveredconfirm/confirm/schedule/newDeliveredConfirmSchedule`, {
    method: 'POST',
    body: payload,
  });
}
// 全部未送达
// export async function unDeliveredConfirmSchedule(payload) {
//   return request(`/itms-schedule/itms-schedule/operation/deliveredconfirm/confirm/schedule/unDeliveredConfirmSchedule`, {
//     method: 'POST',
//     body: payload
//   });
// }
export async function updateNoDelivered(payload){
  return request(`/itms-schedule/itms-schedule/newoperation/deliveredconfirm/confirm/schedule/updateNoDelivered`, {
    method: 'POST',
    body: payload
  });
}

export async function pendingStatistics(payload){
  return request(`/itms-schedule/itms-schedule/newoperation/deliveredconfirm/confirm/pendingStatistics/${payload.companyUuid}/${payload.dispatchCenterUuid}`, {
    method: 'POST',
    body: payload
  });
}pendingStatistics