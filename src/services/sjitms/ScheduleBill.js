/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:24:22
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-08-01 12:01:48
 * @version: 1.0
 */
import request from '@/utils/request';
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
    `/itms-schedule/itms-schedule/sj/bill/schedule/getSchedule?companyUuid=${loginCompany().uuid
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
//保存
export async function batchSave(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/batchSave`, {
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
export async function abortedAndReset(Uuid, moveTengBox) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/abortedAndReset?billUuid=${Uuid}&moveTengBox=${moveTengBox}`,
    {
      method: 'PUT',
    }
  );
}
export async function getTengBoxRecord(billNumber) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/getTengBoxRecord?billNumber=${billNumber}`,
    {
      method: 'GET',
    }
  );
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

// 获取空闲码头
export async function getPris() {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/getPris`, {
    method: 'GET',
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
//修改出车顺序
export async function updateOutSerialApi(uuid, outSerial) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/updateOutSerial?uuid=${uuid}&outSerial=${outSerial}`,
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

export async function getVehicleByScheduleUuid(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/getVehicleByScheduleUuid?uuid=${payload}`,
    {
      method: 'POST',
    }
  );
}

export async function checkArea(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/checkArea`, {
    method: 'POST',
    body: payload,
  });
}
export async function checkBaseData(commuuid, dcuuid) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/checkBaseData/${commuuid}/${dcuuid}`,
    {
      method: 'POST',
    }
  );
}
export async function checkAreaSchedule(payload, scheduleuuid) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/checkAreaSchedule?scheduleUuid=${scheduleuuid}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}
export async function refreshETC(scheduleuuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/refreshETC?uuid=${scheduleuuid}`, {
    method: 'POST',
  });
}
export async function checkOrderInSchedule(payload, scheduleuuid) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/checkOrderInSchedule?scheduleUuid=${scheduleuuid}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function GetHistoryLocation(payload) {
  return request(`/itms-schedule/itms-schedule/huoyunren/GetHistoryLocation`, {
    method: 'POST',
    body: payload
  });
}
export async function GetTrunkLocation(payload) {
  return request(`/itms-schedule/itms-schedule/huoyunren/GetTrunkLocation`, {
    method: 'POST',
    body: payload
  });
}
export async function GetTrunkData(payload) {
  return request(`/itms-schedule/itms-schedule/huoyunren/GetTrunkData`, {
    method: 'POST',
    body: payload
  });
}

export async function GetScheduleEvent(billNumber) {
  return request(`/itms-schedule/itms-schedule/sj/bill/scheduleEvent/getScheduleEvent?billNumber=${billNumber}`);
}

export async function GetStopEvent(billNumber) {
  return request(`/itms-schedule/itms-schedule/sj/bill/scheduleEvent/getStopEvent?billNumber=${billNumber}`);
}

export async function GetScheduleDelivery(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/scheduleEvent/getScheduleDelivery?billUuid=${billUuid}`);
}

export async function RefreshDelivery(params) {
  return request(`/itms-schedule/itms-schedule/sj/bill/scheduleEvent/refreshDelivery`, {
    method: 'POST',
    body: params
  });
}