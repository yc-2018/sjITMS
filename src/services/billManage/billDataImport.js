import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

export async function batchImport(payload) {
    return request(`/iwms-bms/bms/import/batchImport?companyUuid=${loginCompany().uuid}&fileKey=${payload.fileKey}`, {
      method: 'POST'
    });
  }