import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

export async function findLineSystemHisTree(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystemHis/findLineSystemHisTree`, {
    method: 'get',
    body: payload,
  });
}
export function systemHisExport(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystemHis/export/${payload}`, {
    method: 'post',
  });
}

export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/modify`, {
    method: 'POST',
    body: payload,
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
    body: payload,
  });
}

export async function findLineSystemTreeByStoreCode(payload) {
  return request(
    `/itms-schedule/itms-schedule/LineSystem/findLineSystemTreeByStoreCode/${payload.company}/${
      payload.dcUuid
    }?code=${payload.code}`,
    {
      method: 'get',
    }
  );
}

export async function findLineSystemTree(payload) {
  return request(
    `/itms-schedule/itms-schedule/LineSystem/findLineSystemTree/${payload.company}/${
      payload.dcUuid
    }`,
    {
      method: 'get',
    }
  );
}

export async function deleteLineSystemTree(payload) {
  return request(
    `/itms-schedule/itms-schedule/line/LineSystemTree/deleteLineSystemTree/${payload}`,
    {
      method: 'get',
    }
  );
}
export async function deleteLines(payload) {
  return request(`/itms-schedule/itms-schedule/line/delete/${payload}`, {
    method: 'get',
  });
}
export function deleteLineStoreAddressById(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/deleteLineAddress/${payload}`, {
    method: 'get',
  });
}
export function batchDeleteByUuids(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/batchDeleteByUuids`, {
    method: 'POST',
    body: payload.uuids,
  });
}
export async function deleteAddressPlanByUuids(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/deleteAddressPlanByUuids`, {
    method: 'POST',
    body: payload.uuids,
  });
}
export async function inScheduleStore(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/inScheduleStore/${payload}`, {
    method: 'get',
  });
}
export async function batchAddScheduleStorePool(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/batchAddScheduleStorePool`, {
    method: 'POST',
    body: payload.uuids,
  });
}
export async function checkStoreExist(payload) {
  return request(
    `/itms-schedule/itms-schedule/lineShipAddress/checkStoreExist/${payload.lineUuid}`,
    {
      method: 'POST',
      body: payload.storeuuids,
    }
  );
}
export async function updateState(LineSystemUuid, state) {
  return request(`/itms-schedule/itms-schedule/LineSystem/updateState/${LineSystemUuid}/${state}`, {
    method: 'get',
  });
  checkStoreExist;
}
export async function isEnable(uuid, enable) {
  return request(`/itms-schedule/itms-schedule/LineSystem/updateEnable?systemUuid=${uuid}&enable=${enable}
    &companyUuid=${loginCompany().uuid}&dispatchcenterUuid=${loginOrg().uuid}`);
}

export async function backupLineSystem(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystem/backupLineSystem?systemUuid=${
    payload.systemUuid
  }&note=${payload.note}
    &companyUuid=${payload.companyUuid}&dispatchcenterUuid=${payload.dispatchcenterUuid}`);
}

// export async function findLineByNameLike(payload) {
//   return request(`/itms-schedule/itms-schedule/LineSystem/findLineByNameLike/${payload}`, {
//     method: 'POST',
//   });
// }
export async function addToNewLine(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/addToNewLine`, {
    method: 'POST',
    body: payload,
  });
}
export async function switchLineAddress(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/switchLineAddress`, {
    method: 'POST',
    body: payload,
  });
}
export async function savePlan(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/savePlan/${payload.lineuuid}`, {
    method: 'POST',
    body: payload.addressIds,
  });
}

export async function updateStoreAddressList(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/updateStoreAddressList`, {
    method: 'POST',
    body: payload.addressList,
  });
}

export async function findChildLine(payload) {
  return await request(`/itms-schedule/itms-schedule/line/findChildLine/${payload.uuid}`, {
    method: 'GET',
  });
}
export async function updateStoreNum(payload) {
  return await request(`/itms-schedule/itms-schedule/line/updateStoreNum/${payload.lineUuid}`, {
    method: 'GET',
  });
}

export function getMatchLine(payload) {
  return request(`/itms-schedule/itms-schedule/line/getMatchLine`, {
    method: 'POST',
    body: {
      uuid: payload,
    },
  });
}
export function updateNote(payload) {
  return request(
    `/itms-schedule/itms-schedule/lineShipAddress/updateNote/${payload.uuid}/${payload.note}`,
    {
      method: 'get',
    }
  );
}
export function updateIsNewStore(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/updateIsNewStore/${payload.flag}`, {
    method: 'POST',
    body: payload.uuids,
  });
}
updateIsNewStore;
export function YDSiparea(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystem/YDSiparea/${payload.systemUUID}`, {
    method: 'POST',
  });
}

export function exportLineSystem(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystem/export/${payload.systemUUID}`, {
    method: 'POST',
  });
}
export async function checkShipArea(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/checkShipArea/${payload.lineuuid}`, {
    method: 'POST',
    body: payload.addressIds,
  });
}
export async function updateLineOrder(payload) {
  return request(`/itms-schedule/itms-schedule/lineShipAddress/updateLineOrder`, {
    method: 'POST',
    body: payload,
  });
}

export async function sortDateSourceTree(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystem/sortDateSourceTree`, {
    method: 'POST',
    body: payload,
  });
}
