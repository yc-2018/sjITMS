import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function getRfVersion() {
  return request(`/iwms-account/account/rf/getVersion?orgId=${loginOrg().uuid}`);
}

export async function getAccountVersion() {
  return request(`/iwms-account/account/about`);
}

export async function getBasicVersion() {
  return request(`/iwms-basic/basic/about`);
}

export async function getFacilityVersion() {
  return request(`/iwms-facility/facility/about`);
}

export async function getOpenapiVersion(){
  return request(`/iwms-openapi/api/about`);
}
