import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function batchImport(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/weishang/batchimport?companyUuid=${
      loginCompany().uuid
    }&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}&isManager=${payload.isManager}`,
    {
      method: 'POST',
    }
  );
}
