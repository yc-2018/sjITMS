import {stringify} from 'qs';
import request from '@/utils/request';
import {loginCompany,loginOrg} from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/save`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(uuid) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/${uuid}`);
}

export async function getByBillNumberAndDcUuid(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/getbynumber?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`,{
    method: 'GET',
  });
}

export async function cancel(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/canceled?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${payload.dispatchCenterUuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryConfirmedOrder(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/queryConfirmedOrder`, {
    method: 'POST',
    body: payload,
  });
}

export async function collectCash(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/collectCash`, {
    method: 'POST',
    body: payload,
  });
}

export async function initial(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/initial?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${payload.dispatchCenterUuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function batchImport(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/batchimport?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}

export async function deleteOrder(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/delete?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function split(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/split`, {
    method: 'POST',
    body: payload,
  });
}

export async function splitOrder(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/splitOrder`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryWaveNumByState(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/queryWaveNumByState?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&state=${payload.state}`, {
    method: 'POST',
  });
}

export async function returnCancel(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/returnCanceled?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${payload.dispatchCenterUuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function changeOrderType (payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/changeOrderType?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${payload.dispatchCenterUuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function getReBills(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/getReBills?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&groupNumber=${payload.groupNumber}&ownerUuid=${''}&storeUuid=${''}`,{
    method: 'GET',
  });
}

export async function getReShipBills(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/getReShipBills?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&groupNumber=${payload.groupNumber}&waveNum=${payload.waveNum}&startCreatedTime=${payload.startCreatedTime}&endCreatedTime=${payload.endCreatedTime}&sourceNum=${payload.sourceNum}&ownerUuid=${''}&storeUuid=${''}`,{
    method: 'GET',
  });
}

export async function getWaitResendBills(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/getWaitResendBills?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&ownerUuid=${''}&storeUuid=${''}`,{
    method: 'GET',
  });
}


export async function queryDeliveryBill(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/queryDeliveryBill`,{
    method: 'POST',
    body: payload,
  });
}

export async function getByOrderBillDispatch (payload){
  return request(`/itms-schedule/itms-schedule/receipt/getByOrderBillDispatch`,{
    method: 'POST',
    body: payload,
  });
}

export async function batchSave(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/batchSave`, {
    method: 'POST',
    body: payload,
  });
}

export async function getExportTemplate(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/getExportTemplate?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`,{
    method: 'GET',
  });
}

export async function addOrUpdateExportTemplate(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/addOrUpdateExportTemplate`, {
    method: 'POST',
    body: payload,
  });
}

export async function batchExportAndDownload(payload) {
  return request(`/itms-schedule/itms-schedule/bill/ordertms/batchExportAndDownload`, {
    method: 'POST',
    body: payload,
  });
}

