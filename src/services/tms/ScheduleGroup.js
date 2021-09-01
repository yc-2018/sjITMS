import request from "@/utils/request";
import { loginOrg, loginCompany } from "@/utils/LoginContext";

export async function query(payload) {
  return request(`/itms-schedule/itms-schedule/schedulegroupnum/getAllScheduleGroupNum?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`, {
    method: 'POST',
  });
}

export async function get(payload) {
  return request(`/itms-schedule/itms-schedule/schedulegroupnum/${payload}`, {
    method: 'GET',
  });
}

export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/schedulegroupnum/modify`, {
    method: 'POST',
    body: payload
  });
}
 
export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/schedulegroupnum/save`, {
    method: 'POST',
    body: payload
  });
}

export async function remove(payload) {
  return request(`/itms-schedule/itms-schedule/schedulegroupnum/delete?uuid=${payload.uuid}`, {
    method: 'POST',
  });
}

export async function deleteByUuids(payload) {
  return request(`/itms-schedule/itms-schedule/schedulegroupnum/deleteByUuids`, {
    method: 'POST',
    body: payload

  });
}