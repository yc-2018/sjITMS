/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 11:46:03
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-25 14:34:12
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Modal, message } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import {
  commonLocale,
  notNullLocale,
  placeholderLocale,
  placeholderChooseLocale,
  confirmLineFieldNotNullLocale,
} from '@/utils/CommonLocale';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ArticleCreatePage extends QuickCreatePage {
  onSave = data => {
    const { entity } = this;
    const { onlFormInfos } = this.state;

    //保存前对address字段做处理 不进行保存
    for (let onlFormInfo of onlFormInfos) {
      let addItem = onlFormInfo.onlFormFields.find(item => item.fieldShowType == 'address');
      if (addItem) {
        delete this.entity[onlFormInfo.onlFormHead.tableName][0][addItem.dbFieldName];
      }
    }

    console.log('state', this.state.runTimeProps);
    console.log('entity', entity);

    const { sj_itms_article_OWNERUUID } = this.state.runTimeProps;
    const saveDispatchCenter = entity.sj_itms_article[0].DISPATCHCENTERUUID;
    const saveOwnerUuid = entity.sj_itms_article[0].OWNERUUID;

    const DISPATCHCENTERUUID = sj_itms_article_OWNERUUID.sourceData.find(
      x => x.UUID == saveOwnerUuid
    ).DISPATCHCENTERUUID;

    if (DISPATCHCENTERUUID !== saveDispatchCenter) {
      Modal.confirm({
        title: '调度中心配置与货主的调度中心不匹配，是否保存?',
        content: '',
        okText: '是',
        okType: 'primary',
        cancelText: '否',
        onOk: this.handleOk.bind(),
        onCancel() {
          return false;
        },
      });
    }
  };

  handleOk = async () => {
    const { entity } = this;
    this.onSaveSetOrg();

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
    return true;
  };
}
