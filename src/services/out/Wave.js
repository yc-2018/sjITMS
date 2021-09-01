import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { async } from 'q';

export async function save(payload) {
  return request(`/iwms-facility/facility/wave`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteWave(payload) {
  return request(`/iwms-facility/facility/wave/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/wave/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/wave/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/wave/${payload.uuid}`);
}

export async function getByWaveUuid(payload) {
  return request(`/iwms-facility/facility/wave/getByWaveUuid?uuid=${payload.uuid}`);
}

//查询波次单执行进度
export async function getSchedule(payload) {
  return request(`/iwms-facility/facility/wave/${payload.billNumber}/schedule?dcUuid=${loginOrg().uuid}`);
}

export async function start(payload) {
  return request(`/iwms-facility/facility/wave/${payload.uuid}/start?version=${payload.version}`, {
    method: 'POST',
  },true);
}

export async function finish(payload) {
  return request(`/iwms-facility/facility/wave/${payload.billNumber}/finish?dcUuid=${loginOrg().uuid}&finishOrder=${payload.finishOrder}`, {
    method: 'POST',
  });
}

export async function execute(payload) {
  return request(`/iwms-facility/facility/wave/${payload.uuid}/execute`, {
    method: 'POST',
  });
}

export async function rollBack(payload) {
  return request(`/iwms-facility/facility/wave/${payload.uuid}/rollBack?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function confirm(payload) {
  return request(`/iwms-facility/facility/wave/${payload.uuid}/confirm?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function queryStoreInfo(payload) {
  return request(`/iwms-facility/facility/wave/queryStoreInfo?billNumber=${payload.billNumber}&dcUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function modifyOrderItem(payload) {
  return request(`/iwms-facility/facility/wave/modifyOrderItem?billNumber=${payload.billNumber}&dcUuid=${loginOrg().uuid}&storeUuid=${payload.storeUuid}&orderNo=${payload.orderNo}`, {
    method: 'POST',
  });
}

export async function queryWaveDifference(payload) {
  return request(`/iwms-facility/facility/wave/queryWaveDifference?waveBillUuid=${payload.waveBillUuid}&articleCode=${payload.articleCode}&fillRate=${payload.fillRate}`, {
    method: 'GET',
  });
}

export async function queryUnReceivedInfo(payload) {
  return request(`/iwms-facility/facility/wave/queryUnReceivedInfo?billNumber=${payload.billNumber}&dcUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function queryReceiveStockInfos(payload) {
  return request(`/iwms-facility/facility/wave/queryReceiveStockInfos?billNumber=${payload.billNumber}&dcUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/wave/${billNumber}/get?dcUuid=${loginOrg().uuid}`);
}

export async function abort(billNumber) {
  return request(`/iwms-facility/facility/wave/${billNumber}/abort?dcUuid=${loginOrg().uuid}`, {
    method: 'POST'
  });
}

export async function recalcPalletBin(uuid) {
  return request(`/iwms-facility/facility/wave/${uuid}/recalcPalletBin`, {
    method: 'POST'
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/wave/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/wave/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
