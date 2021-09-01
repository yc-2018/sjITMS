import { func } from "prop-types";
import request from "@/utils/request";
import { loginOrg, loginCompany } from "@/utils/LoginContext";

export async function query(payload) {
  return request(`/itms-schedule/itms-schedule/operation/dispatchreturn/query`, {
    method: 'POST',
    body: payload
  });
}


export async function queryByStore(payload) {
  return request(`/itms-schedule/itms-schedule/operation/dispatchreturn/query/store`, {
    method: 'POST',
    body: payload
  });
}

export async function audit(payload) {
  return request(`/itms-schedule/itms-schedule/operation/dispatchreturn/audit`, {
    method: 'POST',
    body: payload
  });
}

export async function confirm(payload) {
  return request(`/itms-schedule/itms-schedule/operation/dispatchreturn/confirm`, {
    method: 'POST',
    body: payload
  });
}

export async function confirmByStore(payload) {
  return request(`/itms-schedule/itms-schedule/operation/dispatchreturn/confirm/store`, {
    method: 'POST',
    body: payload
  });
}