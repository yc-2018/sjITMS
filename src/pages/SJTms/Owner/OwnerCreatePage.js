/*
 * @Author: Liaorongchang
 * @Date: 2023-04-20 17:40:07
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-07-31 10:17:39
 * @version: 1.0
 */

import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { createOrg } from '@/services/sjitms/Owenr';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class OwnerCreatePage extends QuickCreatePage {
  afterSave = async data => {
    const { entity } = this;
    if (data && entity.SJ_ITMS_OWNER[0].OMSCONTROL == 1) {
      await createOrg(entity.SJ_ITMS_OWNER[0].UUID);
    }
  };
}
