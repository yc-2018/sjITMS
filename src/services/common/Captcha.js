import request from '@/utils/request';

export async function getCaptcha() {
  return request(`/iwms-account/account/captcha`);
}

export async function verifyCaptcha(payload) {
  return request(`/iwms-account/account/captcha/verify?code=${payload.imageCaptcha}&key=${payload.captchaKey}`);
}