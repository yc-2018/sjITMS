import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function audit(payload) {
  return request(`/iwms-facility/facility/pick/audit`, {
    method: 'POST',
    body: payload,
  })
}

export async function modifyPickUpBill(payload) {
  return request(`/iwms-facility/facility/pick/modify`, {
    method: 'POST',
    body: payload,
  })
}

export async function auditPick(payload) {
  return request(`/iwms-facility/facility/pick/${payload.uuid}/normalAudit?version=${payload.version}`, {
    method: 'POST'
  })
}

export async function modifyOperate(payload) {
  return request(`/iwms-facility/facility/pick/${payload.uuid}/modifyOperateMethod?version=${payload.version}`, {
    method: 'POST',
  })
}

export async function batchAudit(payload) {
  return request(`/iwms-facility/facility/pick/${payload.uuid}/auditInitial?version=${payload.version}&pickQty=${payload.pickQty}`, {
    method: 'POST',
    body: payload.picker,
  })
}

export async function query(payload) {
  return request(`/iwms-facility/facility/pick/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/pick/${payload.uuid}`);
}

export async function modifyPicker(payload) {
  return request(`/iwms-facility/facility/pick/${payload.uuid}/modifyPicker?version=${payload.version}`, {
    method: 'POST',
    body: payload.picker,
  })
}

export async function printLabel(payload) {
  return request(`/iwms-facility/facility/pick/printLabel`, {
    method: 'POST',
    body: payload,
  })
}

export async function queryElectronicRecord(payload) {
  return request(`/iwms-facility/facility/pick/queryRfidPickupBills?billNumber=${payload.billNumber}&waveBillNumber=${payload.waveBillNumber}&dcUuid=${payload.dcUuid}`, {
    method: 'POST',
    body: payload.pickareaUuids,
  })
}

export async function printElectronicLabel(payload) {
  return request(`/iwms-facility/facility/pick/batchPrintLabel`, {
    method: 'POST',
    body: payload,
  })
}

export async function recalculate(payload) {
  return request(`/iwms-facility/facility/pick/recalculateContainers?dcUuid=${payload.dcUuid}`, {
    method: 'POST',
    body: payload.billNumbers,
  })
}

export async function getServerDate() {
  return request(`/iwms-facility/facility/date`)
}

export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/pick/${billNumber}/get?dcUuid=${loginOrg().uuid}`);
}

export async function pickupStockItem(payload) {
  return request(`/iwms-facility/facility/pick/pickupStockItem?uuid=${payload.uuid}`, {
    method: 'GET'
  })
}

// 分播标签打印

export async function queryCrossPrintLabelItem(payload) {
  return request(`/iwms-facility/facility/pick/queryCrossPrintLabelItem?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&containerCode=${payload.containerCode}`, {
    method: 'GET'
  })
}

export async function printCrossLabel(payload) {
  return request(`/iwms-facility/facility/pick/printCrossLabel`, {
    method: 'POST',
    body:payload
  })
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/pick/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/pick/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}



