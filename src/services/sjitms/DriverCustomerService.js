import request from '@/utils/request';

//新建保存工单：同时保存工单的货品明细记录
export function onSaveGoodsDetailRecord(objArr) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/onSaveGoodsDetailRecord`, {
    method: 'POST',
    body: objArr,
  });
}

//批量驳回
export async function onBatchReject(uuids) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/batchReject`, {
    method: 'POST',
    body: uuids,
  });
}

//驳回工单
export async function onReject(param) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/onReject`, {
    method: 'POST',
    body:param
  });
}

/**
 *  发布工单
 *  @param uuids 多个uuid用于逗号分隔
 * */
export async function publish(uuids) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/publish?uuids=${uuids}`, {
    method: 'POST',
  });
}

//获取处理记录
export async function getProcessRecords(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/getProcessRecords?billUuid=${billUuid}`);
}

//获取无联动协助类型和问题类型字典
export async function getTypeDict() {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/getTypeDict`);
}

//获取联动的协助类型和问题类型字典
export async function getLinkTypeDict() {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/getLinkTypeDict`);
}

//处理回复进度
export async function disposeProcess(param) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/disposeProcess`, {
    method: 'POST',
    body: param,
  });
}

//处理回复结果
export async function onResult(param) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/onResult`, {
    method: 'POST',
    body: param,
  });
}
//完结
export async function onFinish(uuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/onFinish?uuid=${uuid}`, {
    method: 'POST',
  });
}

//获取货品详情
export async function getCargoDetails(billUuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/getCargoDetails?billUuid=${billUuid}`);
}

/** 获取单号 */
export function getBillNo(ownerCode) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/getBillNo?ownerCode=${ownerCode}`);
}

/**
 * 司机服务取货
 *
 * @param uuids uuid列表
 * @author ChenGuangLong
 * @since 2024/02/23 14:44:44
 */
export async function driverSvcPickup(uuids) {
  return request(`/itms-schedule/itms-schedule/sj/bill/driverCustomer/driverSvcPickup`, {
    method: 'POST',
    body: uuids,
  });
}
