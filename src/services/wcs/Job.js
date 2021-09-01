import { stringify } from 'qs';
import request from '@/utils/request';

export async function query(payload) {
  return request(`/ips-control-server/dps/control/queryjobinfo`, {
    method: 'POST',
    body: payload,
  });
}

export async function startJob(payload) {
  return request(`/ips-control-server/dps/control/startwork?alcjob=${payload.alcjob}&jobpointuuid=${payload.jobpointuuid}`, {
    method: 'POST'
  });
}

export async function endJob(payload) {
  return request(`/ips-control-server/dps/control/endwork?jobpointuuid=${payload.uuid}`, {
    method: 'POST'
  });
}

export async function getAlc(payload) {
  return request(`/ips-bill-server/ips/bill/dps/getwaitingalcjob?dcuuid=${payload.dcuuid}`);
}


