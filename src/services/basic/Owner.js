import request from '@/utils/request';
import {loginCompany} from '@/utils/LoginContext';

export async function getOwnerByCompanyUuid(payload) {
  let onlyOnline = false;
  if (payload.onlyOnline)
    onlyOnline = true;
  return request(`/iwms-basic/basic/owner/getByCompanyUuid?companyUuid=${payload.companyUuid}&onlyOnline=${onlyOnline}`);
}

export async function save(payload) {
  return request(`/iwms-basic/basic/owner`,{
    method: 'POST',
    body: payload,
  });
}

export async function onLine(payload) {
  return request(`/iwms-basic/basic/owner/${payload.uuid}/online?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function offLine(payload) {
  return request(`/iwms-basic/basic/owner/${payload.uuid}/offline?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function get(payload) {
  return request(`/iwms-basic/basic/owner/${payload}`);
}

export async function getByCode(payload) {
  return request(`/iwms-basic/basic/owner/getByCodeAndCompanyUuid?code=${payload}&companyUuid=${loginCompany().uuid}`);
}

export async function getDefOwner(payload) {
  return request(`/iwms-basic/basic/owner/${payload}/getDefOwner`);
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/owner/modify`,{
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/owner/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function batchImport(payload) {
  return request(`/iwms-basic/basic/owner/batchImport?companyUuid=${loginCompany().uuid}&fileKey=${payload.fileKey}&type=${payload.type}`, {
    method: 'POST'
  });
}



export async function saveOwnerStore(payload) {
  return request(`/iwms-basic/basic/owner/saveOwnerStore`,{
    method: 'POST',
    body: payload,
  });
}

export async function saveOwnerVendor(payload) {
  return request(`/iwms-basic/basic/owner/saveOwnerVendor`,{
    method: 'POST',
    body: payload,
  });
}

export async function queryOwnerStores(payload) {
  return request(`/iwms-basic/basic/owner/${payload}/queryOwnerStores`);
}

export async function queryOwnerVendors(payload) {
  return request(`/iwms-basic/basic/owner/${payload}/queryOwnerVendors`);
}

export async function onLineForStore(payload) {
  return request(`/iwms-basic/basic/owner/${payload.ownerUuid}/OwnerStore/${payload.uuid}/onLine?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function offLineForStore(payload) {
  return request(`/iwms-basic/basic/owner/${payload.ownerUuid}/OwnerStore/${payload.uuid}/offLine?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function onLineForVendor(payload) {
  return request(`/iwms-basic/basic/owner/${payload.ownerUuid}/OwnerVendor/${payload.uuid}/onLine?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function offLineForVendor(payload) {
  return request(`/iwms-basic/basic/owner/${payload.ownerUuid}/OwnerVendor/${payload.uuid}/offLine?version=${payload.version}`, {
    method: 'POST',
  });
}


export async function removeOwnerStore(payload) {
  return request(`/iwms-basic/basic/owner/removeOwnerStore?uuid=${payload}`, {
    method: 'DELETE',
  });
}

export async function removeOwnerVendor(payload) {
  return request(`/iwms-basic/basic/owner/removeOwnerVendor?uuid=${payload}`, {
    method: 'DELETE',
  });
}
