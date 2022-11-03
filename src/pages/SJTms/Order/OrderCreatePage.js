/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:14
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-03 15:53:23
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Input, message } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { commonLocale } from '@/utils/CommonLocale';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class OrderCreatePage extends QuickCreatePage {
  state = {
    ...this.state,
    // articleProp: [],
  };

  onSave = async data => {
    const { entity } = this;
    const { onlFormInfos } = this.state;

    //保存前对address字段做处理 不进行保存
    for (let onlFormInfo of onlFormInfos) {
      let addItem = onlFormInfo.onlFormFields.find(item => item.fieldShowType == 'address');
      if (addItem) {
        delete this.entity[onlFormInfo.onlFormHead.tableName][0][addItem.dbFieldName];
      }
    }

    const result = this.beforeSave(entity);
    if (result === false) {
      return;
    }

    this.onSaveSetOrg();

    //入参
    const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
    this.onSaving();
    const response = await this.saveEntityData(param);
    const success = response.success == true;
    this.afterSave(success);
    if (success) {
      this.onSaved({ response, param });
      message.success(commonLocale.saveSuccessLocale);
    } else {
      message.error('保存失败，输入内容有误，请核实后再保存！');
      this.setState({ saving: false });
    }
  };
}
