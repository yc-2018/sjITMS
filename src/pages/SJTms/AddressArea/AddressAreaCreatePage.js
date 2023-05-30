/*
 * @Author: qiuhui
 * @Date: 2022-04-16 17:45:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-03-29 08:42:33
 * @version: 1.0
 */

import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { updateVehicleShipArea } from '@/services/sjitms/Vehicle';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class AddressAreaCreatePage extends QuickCreatePage {
  initEntity = () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
    this.initUpdateEntity(onlFormInfos);
  };

  afterSave = async data => {
    const { entity } = this;
    if (data) {
      await updateVehicleShipArea(entity['sj_itms_ship_address_area'][0].UUID);
    }
  };
}
