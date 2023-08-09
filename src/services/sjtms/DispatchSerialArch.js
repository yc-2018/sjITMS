import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { async } from 'q';

// 新增线路体系
export async function save(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/saveSerialArch`, {
    method: 'POST',
    body: payload,
  });
}
// 根据uuid查询线路
export async function getLineByUuid(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/getLineByUuid?lineUuid=${payload.lineUuid}`);
}
// 查询企业下所有线路体系
export async function query(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/getSerialArchs?companyUuid=${payload.companyUuid}&dispatchCenterUuid=${payload.dispatchCenterUuid}`);
}

// 改变调用状态
export async function changeDispatchState(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/changeDispatchState?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'POST'
  });
}
// 改变使用状态
export async function changeSerialArchState(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/changeSerialArchState?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'POST'
  });
}

// 编辑线路体系
export async function modifyArch(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/modifySerialArch`, {
    method: 'POST',
    body: payload
  });
}
// 编辑线路
export async function modifyLine(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/modifySerialArchLine`, {
    method: 'POST',
    body: payload
  });
}
// 分页查询线路客户
export async function queryLines(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/page`, {
    method: 'POST',
    body: payload
  });
}
// 删除线路体系
export async function removeSerialArch(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/removeArch?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'DELETE',
  });
}
// 删除线路
export async function removeLine(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/removeArchLine?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'DELETE',
  });
}
// 删除门店
export async function removeLineStore(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/removeLineStore?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}
// 批量删除门店
export async function batchRemoveLineStore(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/batchRemoveLineStore`, {
    method: 'POST',
    body: payload
  });
}
// 添加线路门店
export async function saveLineStore(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/saveLineStore`, {
    method: 'POST',
    body: payload
  });
}
// 新增线路
export async function saveLine(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/saveSerialArchLine`, {
    method: 'POST',
    body: payload,
  });
}

export async function getStoresByArchLineUuid(payload) {
  return request(`/iwms-facility/facility/serialarch/linestores?lineUuid=${payload.lineUuid}`);
}

// 排序
export async function sort(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/adjust?orderNo=${payload.orderNo}&serialArchLineUuid=${payload.serialArchLineUuid}&storeUuid=${payload.storeUuid}`, {
    method: 'POST'
  });
}
// 导入
export async function batchImport(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/batchimport?companyUuid=${payload.companyUuid}&dispatchCenterUuid=${payload.dispatchCenterUuid}&fileKey=${payload.fileKey}&serialArchUuid=${payload.serialArchUuid}`, {
    method: 'POST',
  });
}

// 线路导入
export async function batchImportSerialArchLine(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/batchImportSerialArchLine?companyUuid=${payload.companyUuid}&dispatchCenterUuid=${payload.dispatchCenterUuid}&fileKey=${payload.fileKey}&serialArchUuid=${payload.serialArchUuid}`, {
    method: 'POST',
  });
}

// 获取当前线路体系下的所有线路

export async function getLinesByArchUuid(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/getLinesByArchCode?dispatchCenterUuid=${payload.dispatchCenterUuid}&serialArchUuid=${payload.serialArchUuid}`);
}

// 根据线路体系UUID获取线路体系明细

export async function getSerialArchByUuid(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/getSerialArchByUuid?uuid=${payload.uuid}`);
}

// 查询不在线路下的启用客户

export async function getStoreUCN(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/getStoreUCN?companyUuid=${payload.companyUuid}&&serialArchUuid=${payload.serialArchUuid}&storeType=${payload.storeType}`);
}


export async function getOnlineSerialArchs(payload){
  return request(`/iwms-facility/facility/dispatchserialarch/getOnlineSerialArchs?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`);
}

export async function getSerialArch(payload){
  return request(`/iwms-facility/facility/dispatchserialarch/getSerialArch?companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`);
}

// 以下是线路体系优化界面新增接口

// 根据查询条件分页查询线路体系下的门店

export async function queryDispatchSerialArchLineStore(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/queryDispatchSerialArchLineStore`, {
    method: 'POST',
    body: payload
  });
}

// 查询不在线路下的启用客户

export async function getStoreUCNByStoreCodeName(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/getStoreUCNByStoreCodeName`, {
    method: 'POST',
    body: payload
  });
}

// 查询不在线路下的启用客户

export async function getLinesByArchCodeAndClassGroupCodeName(payload) {
  return request(`/iwms-facility/facility/dispatchserialarch/getLinesByArchCodeAndClassGroupCodeName?classGroupCodeName=${payload.classGroupCodeName}&dispatchCenterUuid=${payload.dispatchCenterUuid}&serialArchLineCodeName=${payload.serialArchLineCodeName}&serialArchUuid=${payload.serialArchUuid}`);
}
