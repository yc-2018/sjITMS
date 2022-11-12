/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:24:22
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-12 17:19:11
 * @version: 1.0
 */
import request from '@/utils/request';
import axios from 'axios';
import configs from '@/utils/config';
import { loginCompany, loginOrg, loginKey } from '@/utils/LoginContext';

//根据uuid获取排车单
export async function getSchedule(uuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/get?uuid=${uuid}`, {
    method: 'GET',
  });
}
//根据排车单uuid列表，获取排车明细
export async function getDetailByBillUuids(billUuids) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/getDetailByBillUuids`, {
    body: billUuids,
    method: 'POST',
  });
}

//获取排车单
export async function querySchedule(searchKeyValues) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/getSchedule?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
      body: searchKeyValues,
    }
  );
}

//保存
export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/save`, {
    method: 'POST',
    body: payload,
  });
}
//排车单添加运输订单
export async function addOrders(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/addOrders`, {
    method: 'POST',
    body: payload,
  });
}
//删除排车单运输订单
export async function removeOrders(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/removeOrders`, {
    method: 'POST',
    body: payload,
  });
}
//修改
export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/modify`, {
    method: 'POST',
    body: payload,
  });
}
//修改排车数量
export async function modifyNumber(uuid, cartonCount) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/modifyNumber?uuid=${uuid}&cartonCount=${cartonCount}`,
    {
      method: 'POST',
    }
  );
}

//批准
export async function approve(billUuid, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/approve?billUuid=${billUuid}&version=${version}`,
    {
      method: 'POST',
    }
  );
}
// 取消批准/回滚
export async function cancelApprove(billUuid, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/shipRollback?billUuid=${billUuid}&version=${version}`,
    {
      method: 'PUT',
    }
  );
}

//删除
export async function remove(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/remove?billUuid=${billUuid}`, {
    method: 'POST',
  });
}

//作废
export async function aborted(Uuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/aborted?billUuid=${Uuid}`, {
    method: 'PUT',
  });
}

//作废并重排
export async function abortedAndReset(Uuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/abortedAndReset?billUuid=${Uuid}`, {
    method: 'PUT',
  });
}

//取消作废
export async function cancelAborted(billUuid, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/cancelAborted?billUuid=${billUuid}&version=${version}`,
    {
      method: 'PUT',
    }
  );
}

// 取消批准/回滚
export async function shipRollback(Uuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/shipRollback?billUuid=${Uuid}`, {
    method: 'PUT',
  });
}

// 修改码头
export async function updatePris(uuid, pris) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/updatePris?uuid=${uuid}&pris=${pris}`,
    {
      method: 'PUT',
    }
  );
}

//移车
export async function removeCar(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/removeCar`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOfUpdateLifecycle(payload) {
  console.log('payload', payload);
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/saveOfUpdateLifecycle`, {
    method: 'POST',
    body: payload,
  });
}

export async function getRecommend(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/recommend`, {
    method: 'POST',
    body: payload,
  });
}

export async function vehicleApply(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/vehicleApply?scheduleUuid=${
      payload.scheduleUuid
    }&weight=${payload.applyWeight}&note=${payload.applyNote}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function vehicleApplyAudit(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/vehicleApplyAudit?uuid=${payload}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function vehicleApplyRejected(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/vehicleApplyRejected?uuid=${payload}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

// export async function portVehicleApply(payload) {
//   return request(`/itms-schedule/itms-schedule/sj/bill/schedule/portVehicleApply`, {
//     method: 'POST',
//     body: payload,
//   });
// }

export function portVehicleApply(payload) {
  axios(
    configs[API_ENV].API_SERVER + `/itms-schedule/itms-schedule/sj/bill/schedule/portVehicleApply`,
    {
      method: 'post',
      responseType: 'blob',
      data: payload,
      headers: {
        iwmsJwt: loginKey(),
        'Content-Type': 'application/json; charset=utf-8',
        Accept: '*/*',
      },
    }
  ).then(res => {
    const date = new Date();
    const month = date.getMonth();
    const day = date.getDay();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      '运管配送每日安排超限申报表（茶山配送组）' + month + day + '.xlsx'
    );
    document.body.appendChild(link);
    link.click();
  });
}
