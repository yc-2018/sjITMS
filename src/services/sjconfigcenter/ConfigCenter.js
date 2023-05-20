import request from '@/utils/request';

export async function getConfigMenus() {
  return request(`/itms-schedule/itms-schedule/configCenter/getConfigMenus`, {
    method: 'GET',
  });
}

export async function saveOrUpdateConfig(payload) {
  return request(`/itms-schedule/itms-schedule/configCenter/saveOrUpdateConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function getConfigData(payload) {
  // eg: payload = {
  //       configNameEn: 'dispatch',  //配置名称
  //       params: {
  //         dispatchcenteruuid:"000000750000003",  //调度中心
  //         key_En:["isCommendVeh"]   //查询字段 (查全部则不传key_en)
  //       }
  //     }
  return request(
    `/itms-schedule/itms-schedule/configCenter/getConfigData/${payload.configNameEn}`,
    {
      method: 'POST',
      body: payload.params,
    }
  );
}

export async function getConfigDataByParams(configNameEn, dispatchcenteruuid, key_En) {
  let payload = {
    configNameEn: configNameEn,
    params: {
      dispatchcenteruuid: dispatchcenteruuid, //调度中心
      key_En: key_En, //查询字段 (查全部则不传key_en)
    },
  };
  return request(
    `/itms-schedule/itms-schedule/configCenter/getConfigData/${payload.configNameEn}`,
    {
      method: 'POST',
      body: payload.params,
    }
  );
}

export async function saveOrUpdateConfigData(payload) {
  return request(`/itms-schedule/itms-schedule/configCenter/saveOrUpdateConfigData`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveNewConfigData(payload) {
  return request(
    `/itms-schedule/itms-schedule/configCenter/saveNewConfigData/${payload.configNameEn}/${
      payload.dispatchcenteruuid
    }?isEdit=${payload.isEdit}`,
    {
      method: 'POST',
      body: payload.body,
    }
  );
}

export async function deleteConfigData(payload) {
  return request(
    `/itms-schedule/itms-schedule/configCenter/deleteConfigData/${payload.configNameEn}`,
    {
      method: 'POST',
      body: payload.body,
    }
  );
}

export async function deleteConfig(payload) {
  return request(`/itms-schedule/itms-schedule/configCenter/deleteConfig/${payload.configNameEn}`, {
    method: 'POST',
  });
}
