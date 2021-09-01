import request from '@/utils/request';

/**
 * 登录时发送验证码
 * @param {String} phoneNumber 手机号
 */
export async function sendLoginCaptcha(phoneNumber) {
  return request(`/iwms-account/account/sms/logincaptcha?phoneNumber=${phoneNumber}`, {
    method: 'POST',
  });
}

/**
 * 忘记密码时发送验证码
 * @param {String} phoneNumber 手机号
 */
export async function sendForgetPwdCaptcha(payload) {
  return request(`/iwms-account/account/sms/forgetcaptcha?phoneNumber=${payload}`, {
    method: 'POST',
  });
}
