import { stringify } from 'qs';
import request from '@/utils/request';

export async function get() {
  return request(`/iwms-account/account/resource`);
}

export async function fetch() {
  return request(`/iwms-account/account/resource/fetch`);
}
