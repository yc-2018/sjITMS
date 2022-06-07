/*
 * @Author: Liaorongchang
 * @Date: 2022-04-20 10:41:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-07 11:19:53
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, message, Input } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { getTableInfo } from '@/services/sjtms/BasicSource';
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

    await getTableInfo(this.entity.cost_form[0].TABLENAME).then(response => {
      if (this.entity['cost_form_field'] == undefined) {
        this.entity['cost_form_field'] = [];
      }
      let line = 1;
      response.data.map(data => {
        this.entity['cost_form_field'].push({
          LINE: line,
          DB_FIELD_NAME: data.columnName,
          DB_FIELD_TXT: data.comments,
          DB_TYPE: data.dataType,
          DB_LENGTH: data.dataLength,
        });
        line = line + 1;
      });
    });

    // this.onSaveSetOrg();

    //入参
    const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
    this.onSaving();
    const response = await this.saveEntityData(param);
    const success = response.success == true;
    this.afterSave(success);
    this.onSaved(success);
    if (success) {
      message.success(commonLocale.saveSuccessLocale);
    }
  };
}
