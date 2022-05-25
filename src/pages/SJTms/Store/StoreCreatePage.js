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
export default class StoreCreatePage extends QuickCreatePage {
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

    const { SJ_ITMS_SHIP_ADDRESS_OWNERUUID } = this.state.runTimeProps;
    const saveDispatchCenter = entity.SJ_ITMS_SHIP_ADDRESS[0].DISPATCHCENTERUUID;
    const saveOwner = entity.SJ_ITMS_SHIP_ADDRESS[0].OWNERUUID;

    const DISPATCHCENTERUUID = SJ_ITMS_SHIP_ADDRESS_OWNERUUID.sourceData.find(
      x => x.UUID == saveOwner
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
  };
}
