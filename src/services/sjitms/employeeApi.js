import request from '@/utils/request';

/**
 * 承运商账号注册
 * @param code 用户工号
 * @author ChenGuangLong
 * @since 2024/6/20 9:39
 */
export const registerCarrier = (code) =>
  request(`/itms-schedule/itms-schedule/sj/bill/user/external/sign?code=${code}`, { method: 'POST' })

/**
 * 美宜佳账号注册
 * @param code 用户工号
 * @author ChenGuangLong
 * @since 2024/6/20 9:33
 */
export const registerMyj = (code) =>
  request(`/itms-schedule/itms-schedule/myjAccoun/empRegister?userCode=${code}`, { method: 'POST' })
