/*
 * @Author: Liaorongchang
 * @Date: 2022-04-20 10:41:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-27 15:51:32
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, message, Input } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { getTableInfo } from '@/services/cost/BasicSource';
import { commonLocale } from '@/utils/CommonLocale';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class BasicDtlCreatPage extends QuickCreatePage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
    };
  }

  onSave = async data => {
    const { entity } = this;
    const { onlFormInfos } = this.state;

    const response = await getTableInfo(this.entity.cost_form[0].TABLENAME);
    if (response.success && !response.data) {
      message.error('表不存在，请核实后再操作');
      return;
    }
    if (this.entity['COST_FORM_FIELD'] == undefined) {
      this.entity['COST_FORM_FIELD'] = [];
    }
    let line = 1;
    response.data.map(data => {
      this.entity['COST_FORM_FIELD'].push({
        LINE: line,
        DB_FIELD_NAME: data.columnName,
        DB_FIELD_TXT: data.comments,
        DB_TYPE: data.dataType,
        DB_LENGTH: data.dataLength,
        SHOW: 0,
      });
      line = line + 1;
    });

    this.onSaveSetOrg();

    //入参
    const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
    this.onSaving();
    const saveResponse = await this.saveEntityData(param);
    const success = saveResponse.success == true;
    this.afterSave(success);
    const result = { response: saveResponse };
    this.onSaved(result);
    if (success) {
      message.success(commonLocale.saveSuccessLocale);
    }
  };
}
