import { func } from "prop-types";
import request from "@/utils/request";
import { loginOrg, loginCompany } from "@/utils/LoginContext";

export async function query(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/page`, {
    method: 'POST',
    body: payload
  });
}

export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/modify`, {
    method: 'POST',
    body: payload
  });
}

export async function remove(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/${payload}`, {
    method: 'POST',
  });
}
export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/feetype`, {
    method: 'POST',
    body: payload
  });
}