import request from "@/utils/request";

export async function addorderaticlestoschedule (payload) {
  return request(`/itms-schedule/itms-schedule/operation/delivery/addorderaticlestoschedule`, {
    method: 'POST',
    body: payload
  });
}

export async function removeorderarticlesfromschedule (payload) {
  return request(`/itms-schedule/itms-schedule/operation/delivery/removeorderarticlesfromschedule?scheduleUuid=${payload.scheduleUuid}`, {
    method: 'POST',
    body: payload.scheduleArticleUuids
  });
}

export async function adjust(payload) {
  return request(`/itms-schedule/itms-schedule/operation/delivery/adjust?uuid=${payload.uuid}&line=${payload.line}&upDown=${payload.upDown}`, {
    method: 'POST',
    body: payload
  });
}
