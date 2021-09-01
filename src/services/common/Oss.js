import { stringify } from 'qs';
import request from '@/utils/request';

/**
 * OSS - 上传接口
 */
export async function upload(payload) {
  return request(`/iwms-account/account/oss/upload`, {
    method: 'POST',
    body: payload
  });
}

/**
 * OOS - 根据文件上传的key，获取文件下载路径
 * 
 * @param {Sting} key 文件上传后返回的key
 */
export async function get(key) {
  return request(`/iwms-account/account/oss?key=${key}`);
}