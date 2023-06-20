import request from '@/utils/request';

export async function queryDict(dictCode) {
  return request(`/itms-schedule/itms-schedule/openapi/dict/findDictByDictType/${dictCode}`, {
    method: 'GET',
  });
}
export async function queryDictByCode(dictCodes) {
  return request(
    `/itms-schedule/itms-schedule/openapi/dict/findDictByDictCode?dictCodes=${dictCodes}`,
    {
      method: 'GET',
    }
  );
}

export async function queryData(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getData/${payload.quickuuid}/tms`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryCreateConfig(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getOnlFormInfoByCode/${payload}`, {
    method: 'POST',
  });
}

export async function queryColumns(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getColumns`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryAllData(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getAllData/${payload.quickuuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveFormData(param) {
  return request(`/itms-schedule/itms-schedule/dev/saveFormData/${param.code}`, {
    method: 'POST',
    body: param.entity,
  });
}

export async function selectCoulumns(payload) {
  return request(`/itms-schedule/itms-schedule/dev/selectCoulumns/${payload.quickuuid}`, {
    method: 'POST',
    body: payload,
  });
}

//---------------------------------------------------------------------------------------------------//

export async function dynamicDelete(payload, dbSource) {
  return request(
    `/itms-schedule/itms-schedule/devDynamicCRUD/delete/${payload.code}?dbSource=${dbSource}`,
    {
      method: 'POST',
      body: payload.params,
    }
  );
}

export async function dyDelete(payload, dbSource) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/delete?dbSource=${dbSource}`, {
    method: 'POST',
    body: payload.params,
  });
}

export async function dynamicQuery(payload, dbSource) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/query?dbSource=${dbSource}`, {
    method: 'POST',
    body: payload,
  });
}

export async function dynamicqueryById(payload, dbSource) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/query?dbSource=${dbSource}`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOrUpdateEntities(payload, dbSource) {
  return request(
    `/itms-schedule/itms-schedule/devDynamicCRUD/saveOrUpdateEntities?dbSource=${dbSource}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function updateEntity(payload, dbSource) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/update`, {
    method: 'POST',
    body: payload,
  });
}
