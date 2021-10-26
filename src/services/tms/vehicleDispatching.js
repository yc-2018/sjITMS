import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { functionExpression } from '@babel/types';

export async function queryOrder(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/getByOwner?sourceNum=${payload.sourceNum}&classGroupCode=${payload.classGroupCode?payload.classGroupCode:''}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&ownerCode=${payload.ownerCode?payload.ownerCode:''}&pendingTag=${payload.pendingTag}&shipGroupCode=${payload.shipGroupCode?payload.shipGroupCode:''}&deliveryPointCode=${payload.deliveryPointCode?payload.deliveryPointCode:''}&billNumber=${payload.billNumber?payload.billNumber :''}&sourceBillNumber=${payload.sourceBillNumber?payload.sourceBillNumber:''}`, {
    method: 'POST',
    body: payload.storeOrders
  });
}


export async function queryShipPlan(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/getByShipGroup?sourceNum=${payload.sourceNum}&classGroupCode=${payload.classGroupCode?payload.classGroupCode:''}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&ownerCode=${payload.ownerCode?payload.ownerCode:''}`, {
    method: 'POST',
    body: payload
  });
}

export async function getShipPlanByUuid(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/${payload}`, {
    method: 'POST',
    body: payload
  });
}


export async function saveShipPlan(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/save`, {
    method: 'POST',
    body: payload
  });
}

export async function modifyShipPlan(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/modify`, {
    method: 'POST',
    body: payload
  });
}

export async function saveShipPlanOnly(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/savebillonly`, {
    method: 'POST',
    body: payload
  });
}

export async function modifyShipPlanOnly(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/modifybillonly`, {
    method: 'POST',
    body: payload
  });
}


export async function addordertoschedule (payload) {
  return request(`/itms-schedule/itms-schedule/addordertoschedule?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&scheduleUuid=${payload.scheduleUuid}`, {
    method: 'POST',
    body: payload.orderBillNumberList
  });
}


export async function removeorderfromschedule (payload) {
  return request(`/itms-schedule/itms-schedule/removeorderfromschedule?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&scheduleUuid=${payload.scheduleUuid}`, {
    method: 'POST',
    body: payload.orderBillNumberList
  });
}

export async function updateorderpendingtag (payload) {
  return request(`/itms-schedule/itms-schedule/updateorderpendingtag?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&pendingTag=${payload.pendingTag}`, {
    method: 'POST',
    body: payload.orderBillNumberList
  });
}

export async function remove (payload) {
  return request(`/itms-schedule/itms-schedule/schedule/delete?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}
