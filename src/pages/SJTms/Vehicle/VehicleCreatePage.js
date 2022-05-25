/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 11:46:03
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-25 18:40:18
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
export default class VehicleCreatePage extends QuickCreatePage {
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

    const { SJ_ITMS_VEHICLE_VEHICLETYPEUUID } = this.state.runTimeProps;
    const saveDispatchCenter = entity.SJ_ITMS_VEHICLE[0].DISPATCHCENTERUUID;
    const saveVehicleTypeUuid = entity.SJ_ITMS_VEHICLE[0].VEHICLETYPEUUID;

    const DISPATCHCENTERUUID = SJ_ITMS_VEHICLE_VEHICLETYPEUUID.sourceData.find(
      x => x.UUID == saveVehicleTypeUuid
    ).DISPATCHCENTERUUID;

    console.log('DISPATCHCENTERUUID', DISPATCHCENTERUUID);
    console.log('saveDispatchCenter', saveDispatchCenter);

    if (DISPATCHCENTERUUID !== saveDispatchCenter) {
      Modal.confirm({
        title: '调度中心配置与车型的调度中心不匹配，是否保存?',
        content: '',
        okText: '是',
        okType: 'primary',
        cancelText: '否',
        onOk: this.handleOk.bind(),
        onCancel() {
          return false;
        },
      });
    } else {
      this.handleOk();
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
