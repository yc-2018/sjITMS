/*
 * @Author: Liaorongchang
 * @Date: 2022-04-16 17:45:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-16 17:45:35
 * @version: 1.0
 */
/*
 * @Author: Liaorongchang
 * @Date: 2022-03-25 10:17:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-28 17:24:09
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { loginCompany } from '@/utils/LoginContext';
import { saveOrUpdateEntities, dynamicqueryById } from '@/services/quick/Quick';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ShipPlanBillCreatePage extends QuickCreatePage {
  initEntity = () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
    this.initUpdateEntity(onlFormInfos);
  };
}
