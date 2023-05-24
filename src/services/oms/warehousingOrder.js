import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function audited(payload) {
  return request(`/oms-owner/oms-owner/warehousingOrder/audited?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function canceled(payload) {
  return request(`/oms-owner/oms-owner/warehousingOrder/cancel?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function uploading(payload) {
  return request(
    `/oms-owner/oms-owner/warehousingOrder/import?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
      method: 'POST',
    }
  );
}