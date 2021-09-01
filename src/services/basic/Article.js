import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-basic/basic/article/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-basic/basic/article`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/article/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-basic/basic/article/${payload.uuid}`);
}

export async function getByCode(payload) {
  return request(`/iwms-basic/basic/article/getByCode?code=${payload.code}&companyUuid=${loginCompany().uuid}`);
}

export async function online(payload) {
  return request(`/iwms-basic/basic/article/${payload.uuid}/online?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function offline(payload) {
  return request(`/iwms-basic/basic/article/${payload.uuid}/offline?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function batchImport(payload) {
  return request(`/iwms-basic/basic/article/batchImport?companyUuid=${loginCompany().uuid}&fileKey=${payload.fileKey}&type=${payload.type}`, {
    method: 'POST'
  });
}

// export async function getImportTemplateUrl(payload) {
//   return request(`/iwms-basic/basic/article/templet/download?type=${payload.type}`);
// }

export async function saveOrModifyArticleQpc(payload) {
  return request(`/iwms-basic/basic/article/qpc`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOrModifyArticleBarcode(payload) {
  return request(`/iwms-basic/basic/article/barcode`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOrModifyArticleVendor(payload) {
  return request(`/iwms-basic/basic/article/vendor`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOrModifyStorePickQty(payload) {
  return request(`/iwms-basic/basic/article/storePickQty`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeArticleQpc(payload) {
  return request(`/iwms-basic/basic/article/${payload.articleUuid}/qpc/${payload.uuid}/remove`, {
    method: 'DELETE',
  });
}

export async function removeArticleBarcode(payload) {
  return request(`/iwms-basic/basic/article/${payload.articleUuid}/barcode/${payload.uuid}/remove`, {
    method: 'DELETE',
  });
}

export async function removeArticleVendor(payload) {
  return request(`/iwms-basic/basic/article/${payload.articleUuid}/vendor/${payload.uuid}/remove`, {
    method: 'DELETE',
  });
}

export async function removeStorePickQty(payload) {
  return request(`/iwms-basic/basic/article/${payload.articleUuid}/storePickQty/${payload.uuid}/remove`, {
    method: 'DELETE',
  });
}

export async function getQpcsByArticleUuid(payload) {
  return request(`/iwms-basic/basic/article/${payload.articleUuid}/qpc`);
}

export async function queryByUuids(payload) {
  return request(`/iwms-basic/basic/article/query/uuids`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryLikeBarcode(payload) {
  return request(`/iwms-basic/basic/article/queryLikeBarcode?companyUuid=${loginCompany().uuid}&barcode=${payload}`, {
    method: 'GET'
  });
}

export async function queryStock(payload) {
  return request(`/iwms-facility/facility/incinv/queryStock`, {
    method: 'POST',
    body: payload,
  });
}
