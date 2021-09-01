import {stringify} from 'qs';
import request from '@/utils/request';
import {loginCompany,loginOrg} from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/order`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveAndAudit(payload) {
  return request(`/iwms-facility/facility/order/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteOrder(payload) {
  return request(`/iwms-facility/facility/order/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/order/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/order/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function abort(payload) {
  return request(`/iwms-facility/facility/order/abort/${payload.uuid}?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/order/audit/${payload.uuid}?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function batchImport(payload) {
  return request(`/iwms-facility/facility/order/batchimport?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}
// export async function getImportTemplateUrl() {
//   return request(`/iwms-facility/facility/order/templet/download`);
// }

export async function book(payload) {
  return request(`/iwms-facility/facility/order/book/${payload.uuid}?version=${payload.version}&bookedQtyStr=${payload.bookedQtyStr}
  &bookedArticleCount=${payload.bookedArticleCount}&bookTime=${payload.bookTime}`,{method: 'POST'});
}

export async function finish(payload) {
  return request(`/iwms-facility/facility/order/finish/${payload.uuid}?version=${payload.version}`,{
    method: 'POST'
  });
}

export async function dailyFinish(payload) {
  return request(`/iwms-facility/facility/order/dailyFinish/${payload.uuid}?version=${payload.version}`,{
    method: 'POST'
  });
}

export async function receive(payload) {
  return request(`/iwms-facility/facility/order/receive/?billNumber=${payload.billNumber}
  &dcUuid=${payload.dcUuid}&articleUuid=${payload.articleUuid}&qpcStr=${payload.qpcStr}
  &qty=${payload.qty}&version=${payload.version}`,{
    method: 'POST'
  });
}

export async function get(uuid) {
  return request(`/iwms-facility/facility/order/${uuid}`);
}

export async function getBySourceBillNumberAndDcUuid(payload) {
  return request(`/iwms-facility/facility/order/getByBillNumberOrSourceBillNumberAndDcUuid?sourceBillNumber=${payload.sourceBillNumber}&dcUuid=${payload.dcUuid}`);
}

export async function copy(payload) {
  return request(`/iwms-facility/facility/order/copy?${stringify(payload)}`,{
    method: 'POST'
  });
}

export async function pricing(payload) {
  return request(`/iwms-facility/facility/order/pricing?billUuid=${payload.billUuid}&version=${payload.version}`,{
    method: 'POST',
    body: payload.data,
  });
}

export async function totalPricing(payload) {
  return request(`/iwms-facility/facility/order/totalPricing?${stringify(payload)}`,{
    method: 'POST',
  });
}

export async function getByBillNumbers(payload) {
  return request(`/iwms-facility/facility/order/getbybillnumbers?dcUuid=${loginOrg().uuid}`,{
    method: 'POST',
    body: payload,
  });
}

export async function getByBillNumberAndDcUuid(payload) {
  return request(`/iwms-facility/facility/order/getByBillNumberAndDcUuid?billNumber=${payload.billNumber}&dcUuid=${loginOrg().uuid}`,{
    method: 'GET',
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/order/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/order/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

