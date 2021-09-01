import request from "@/utils/request";
import { loginCompany, loginOrg } from "@/utils/LoginContext";

export async function addonlyordertoschedule (payload) {
  return request(`/itms-schedule/itms-schedule/addonlyordertoschedule?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&scheduleUuid=${payload.scheduleUuid}`, {
    method: 'POST',
    body: payload.orderBillNumberList
  });
}

export async function removeonlyorderfromschedule (payload) {
  return request(`/itms-schedule/itms-schedule/removeonlyorderfromschedule?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&scheduleUuid=${payload.scheduleUuid}`, {
    method: 'POST',
    body: payload.orderBillNumberList
  });
}

export async function downtoschedule(payload) {
  return request(`/itms-schedule/itms-schedule/downtoschedule?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}&scheduleUuid=${payload.scheduleUuid}`, {
    method: 'POST',
    body: payload.orderBillList
  });
}
