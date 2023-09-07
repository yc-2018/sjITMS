/*
 * @Author: Liaorongchang
 * @Date: 2022-04-20 10:41:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-15 08:52:01
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, message, Input } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class BasicHeadCreatPage extends QuickCreatePage {
  beforeSave = data => {
    const { onlFormInfos } = this.state;
    const tableName = onlFormInfos[0].onlFormHead.tableName;
    if (this.entity[tableName][0].UUID == undefined) {
      this.entity[tableName][0] = {
        ...this.entity[tableName][0],
        UUID: this.props.uuid,
      };
    }
    return true;
  };
}
