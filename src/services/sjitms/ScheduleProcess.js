/*
 * @Author: guankongjin
 * @Date: 2022-07-13 10:25:32
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-03-31 11:52:53
 * @Description: file content
 * @FilePath: \iwms-web\src\services\sjitms\ScheduleProcess.js
 */
/* eslint-disable import/extensions */
import request from '@/utils/request'
import { loginCompany, loginOrg } from '@/utils/LoginContext'

// 获取刷卡排车单信息
export async function getSwipeSchedule (empId, swipeFlag, companyUuid, dispatchUuid) {
  return request(
    `/itms-schedule/itms-schedule/openapi/bill/schedule/process/getSwipeSchedule?empId=${empId}&swipeFlag=${swipeFlag}&companyUuid=${
      companyUuid
    }&dispatchUuid=${dispatchUuid}`,
    {
      method: 'POST',
    }
  )
}

/**
 * 获取司机放行条信息
 * @author ChenGuangLong
 * @since 2024/4/10 17:09
 */
export async function getReleaseNote (empId) {
  return request(
    `/itms-schedule/itms-schedule/openapi/bill/schedule/process/getReleaseNote?empId=${empId}`,
    { method: 'POST' })
}


// 根据排车单刷卡
export async function swipeByScheduleUuid (uuid) {
  return request(
    `/itms-schedule/itms-schedule/openapi/bill/schedule/process/swipeByScheduleUuid?uuid=${uuid}`,
    {
      method: 'POST',
    }
  )
}

// 刷卡
export async function swipe (empId, swipeFlag) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/swipe?empId=${empId}&swipeFlag=${swipeFlag}&companyUuid=${
      loginCompany().uuid
    }&dispatchUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  )
}

// 司机刷卡
export async function driverSwipe (empId, companyUuid, dispatchUuid, swipeFlag) {
  return request(
    `/itms-schedule/itms-schedule/openapi/bill/schedule/process/swipe?empId=${empId}&swipeFlag=${swipeFlag}&companyUuid=${
      companyUuid
    }&dispatchUuid=${dispatchUuid}`,
    {
      method: 'POST',
    }
  )
}

// 司机刷卡打印
export async function driverSwipePrint (empId, companyUuid, dispatchUuid) {
  return request(
    `/itms-schedule/itms-schedule/openapi/bill/schedule/process/swipePrint?empId=${empId}&companyUuid=${companyUuid}&dispatchUuid=${dispatchUuid}`,
    {
      method: 'POST',
    }
  )
}

// 司机刷卡签到
export async function driverswipeSign (empId, companyUuid, dispatchUuid) {
  return request(
    `/itms-schedule/itms-schedule/openapi/bill/schedule/process/swipeSign?empId=${empId}&companyUuid=${companyUuid}&dispatchUuid=${dispatchUuid}`,
    {
      method: 'POST',
    }
  )
}

// 装车开始
export async function shipping (billNumber, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/shipping?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  )
}

// 装车结束
export async function shiped (billNumber, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/shiped?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  )
}

// 发运
export async function depart (billNumber, version) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/depart?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}`,
    {
      method: 'POST',
    }
  )
}

// 回厂
export async function back (billNumber, version, returnMileage) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/back?billNumber=${billNumber}&version=${version}&companyUuid=${
      loginCompany().uuid
    }&dispatchCenterUuid=${loginOrg().uuid}&returnMileage=${returnMileage}`,
    {
      method: 'POST',
    }
  )
}

// 出/回厂按钮记录
export async function recordLog (billNumber, type) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/schedule/process/recordLog?billNumber=${billNumber}&type=${type}`,
    {
      method: 'POST',
    }
  )
}

// g7接口
export async function callG7Interface (apiName, params) {
  return request(`/itms-schedule/itms-schedule/g7/callG7Interface/${apiName}`, {
    method: 'POST',
    body: params,
  })
}
