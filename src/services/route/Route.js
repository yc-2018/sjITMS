import request from '@/utils/request';

export async function getRouteMenus() {
  return request(`/itms-schedule/itms-schedule/route/getRoutes`, {
    method: 'GET',
    headers: { check_flag: false },
  });
}

export async function getRoutesTreeByParam(param) {
  return request(`/itms-schedule/itms-schedule/route/getRoutesTreeByParam`, {
    method: 'POST',
    body: param,
    headers: { check_flag: false },
  });
}

export async function getRoutesByParam(param) {
  return request(`/itms-schedule/itms-schedule/route/getRoutesByParam`, {
    method: 'POST',
    body: param,
    headers: { check_flag: false },
  });
}

export async function dragRouteMenu(param, requestBody) {
  let url = `/itms-schedule/itms-schedule/route/dragRouteMenu?dropNodeKey=${param.dropNodeKey}`;
  if (param.targetKey) {
    url += `&targetKey=${param.targetKey}`;
  }
  return request(url, {
    method: 'POST',
    body: requestBody,
  });
}
