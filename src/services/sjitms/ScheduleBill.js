/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:24:22
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-28 15:05:05
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { func } from 'prop-types';

//根据uuid获取排车单
export async function getSchedule(uuid) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/get?uuid=${uuid}`, {
    method: 'GET',
  });
}

//根据状态获取排车单
export async function getScheduleByStat(stat) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/getScheduleByStat?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}&Stat=${stat}`,
    {
      method: 'GET',
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
export async function aborted(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/aborted?billUuid=${payload.UUID}&version=${
      payload.FVERSION
    }`,
    {
      method: 'PUT',
    }
  );
}

// 取消批准/回滚
export async function shipRollback(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/shipRollback?billUuid=${payload.UUID}&version=${
      payload.FVERSION
    }`,
    {
      method: 'PUT',
    }
  );
}

export async function removeCar(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/schedule/removeCar`, {
    method: 'POST',
    body: payload,
  });
}
