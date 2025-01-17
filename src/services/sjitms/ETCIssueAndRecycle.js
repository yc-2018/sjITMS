/*
 * @Author: Liaorongchang
 * @Date: 2022-09-27 09:50:55
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-06 09:56:15
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
//推荐
export async function recommend(billNumber) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/recommend?billNumber=${billNumber}&companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}
//发卡
export async function issue(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/issue?companyUuid=${loginCompany().uuid}&dcUuid=${
      loginOrg().uuid
    }`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

//补发卡
export async function repairIssue(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/repairIssue?companyUuid=${loginCompany().uuid}&dcUuid=${
      loginOrg().uuid
    }`,
    {
      method: 'POST',
      body: payload,
    }
  );
}
//取消发卡
export async function cancelIssue(billNumber) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/cancelIssue?billNumber=${billNumber}&companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  );
}
//回收
export async function recycle(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/recycle?companyUuid=${loginCompany().uuid}&dcUuid=${
      loginOrg().uuid
    }`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

//申请发卡
export async function applyIssue(billNumber, note) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/applyIssue?billNumber=${billNumber}&companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}&note=${note}`,
    {
      method: 'POST',
    }
  );
}

//批准发卡
export async function approval(uuid) {
  return request(`/itms-schedule/itms-schedule/sj/etc/approval?uuid=${uuid}`, {
    method: 'POST',
  });
}

//驳回发卡申请
export async function rejected(uuid) {
  return request(`/itms-schedule/itms-schedule/sj/etc/rejected?uuid=${uuid}`, {
    method: 'POST',
  });
}

export async function uploading(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/etc/import?companyUuid=${loginCompany().uuid}&dcUuid=${
      loginOrg().uuid
    }&fileKey=${payload.fileKey}`,
    {
      method: 'POST',
    }
  );
}
