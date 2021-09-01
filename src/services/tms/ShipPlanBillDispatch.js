import { func } from "prop-types";
import request from "@/utils/request";
import { loginOrg, loginCompany } from "@/utils/LoginContext";
import { async } from "q";

export async function queryShipPlan(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/page`, {
    method: 'POST',
    body: payload
  });
}

export async function getShipPlanByUuid(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/${payload}`, {
    method: 'GET',
  });
}

export async function getTakeDeliveryScheduleMerge(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/getTakeDeliveryScheduleMerge/${payload}`, {
    method: 'GET',
  });
}


export async function getMerge(payload){
  return request(`/itms-schedule/itms-schedule/schedule/getMerge?uuid=${payload}`, {
    method: 'GET',
  });
}

export async function getDeliveryScheduleMerge(payload){
  return request(`/itms-schedule/itms-schedule/schedule/getDeliveryScheduleMerge?uuid=${payload}`, {
    method: 'GET',
  });
}
export async function getOnlyBillScheduleMerge(payload){
  return request(`/itms-schedule/itms-schedule/schedule/getOnlyBillScheduleMerge?uuid=${payload}`, {
    method: 'GET',
  });
}

export async function move(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/move`, {
    method: 'POST',
    body: payload
  });
}

export async function getShipPlanByBillNumber(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/getbynumber?billNumber=${payload}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function getByRelationBillNumber(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/getByRelationBillNumber?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&relationBillNumber=${payload}`, {
    method: 'GET',
  });
}


export async function modifyShipPlan(payload) {
  return request(`/itms-schedule/itms-schedule/schedule/modify`, {
    method: 'POST',
    body: payload
  });
}

export async function onAborted(payload){
  return request(`/itms-schedule/itms-schedule/schedule/aborted?billUuid=${payload.billUuid}&version=${payload.version}`, {
    method: 'PUT',
  });
}

export async function onApprove(payload){
  return request(`/itms-schedule/itms-schedule/schedule/approve?billUuid=${payload.billUuid}&version=${payload.version}`, {
    method: 'PUT',
  });
}

export async function shipRollback(payload){
  return request(`/itms-schedule/itms-schedule/schedule/shipRollback?billUuid=${payload.billUuid}&version=${payload.version}`, {
    method: 'PUT',
  });
}

export async function adjust(payload){
  return request(`/itms-schedule/itms-schedule/schedule/adjust?billUuid=${payload.billUuid}&line=${payload.line}&upDown=${payload.upDown}`, {
    method: 'POST',
  });
}

export async function queryScheduleBill(payload){
  return request(`/itms-schedule/itms-schedule/schedule/queryScheduleBill`, {
    method: 'POST',
    body: payload
  });
}

