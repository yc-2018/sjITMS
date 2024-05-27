/*
 * @Author: qiuhui
 * @Date: 2023-05-19 10:28:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-27 16:47:39
 * @version: 1.0
 */
import request from '@/utils/request';

/**
 * 获取门店图片URL地址
 * @param {String} uuid 审核单uuid
 * @author ChenGuangLong
 * @since 2024/5/27 10:10
*/
export async function getStoreImgList(uuid) {
  return request(`/itms-schedule/itms-schedule/addressReport/getStoreImg?uuid=${uuid}`, {
    method: 'POST'
  });
}

/**
 * 通过审核
 * @param {String} uuid 审核单uuid
 * @author ChenGuangLong
 * @since 2024/5/27 10:42
*/
export async function audit(uuid) {
  return request(`/itms-schedule/itms-schedule/addressReport/audit?uuid=${uuid}`, {
    method: 'POST'
  });
}

/**
 * 作废
 * @param {String} uuid 审核单uuid
 * @author ChenGuangLong
 * @since 2024/5/27 10:41
*/
export async function voided(uuid) {
  return request(`/itms-schedule/itms-schedule/addressReport/voided?uuid=${uuid}`, {
    method: 'POST'
  });
}



export async function audits(params) {
  return request(`/itms-schedule/itms-schedule/addressReport/audits`, {
    method: 'POST',
    body: params,
  });
}

export async function cancellation(params) {
  return request(`/itms-schedule/itms-schedule/addressReport/cancellation`, {
    method: 'POST',
    body: params,
  });
}

