/*
 * @Author: Liaorongchang
 * @Date: 2022-04-20 10:41:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-25 15:20:44
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, message } from 'antd';
import { loginCompany } from '@/utils/LoginContext';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { dynamicqueryById } from '@/services/quick/Quick';
import { removeCar } from '@/services/sjitms/ScheduleBill';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class RemoveCarCreatePage extends QuickCreatePage {
  exHandleChange = async e => {
    const { tableName, fieldName, line, fieldShowType, props, valueEvent } = e;
    const { form } = this.props;

    if (fieldName == 'REMOVECAR' && valueEvent) {
      const param = {
        tableName: 'sj_itms_vehicle_employee',
        condition: {
          params: [
            { field: 'vehicleuuid', rule: 'eq', val: [valueEvent.record.UUID] },
            { field: 'companyuuid', rule: 'eq', val: [loginCompany().uuid] },
          ],
        },
      };

      await dynamicqueryById(param).then(result => {
        if (result.success && result.result.records !== 'false') {
          this.entity['SJ_ITMS_VEHICLE_EMPLOYEE'] = [];
          result.result.records.forEach((data, index) => {
            this.entity['SJ_ITMS_VEHICLE_EMPLOYEE'].push({
              COMPANYUUID: data.COMPANYUUID,
              EMPCODE: data.EMPCODE,
              EMPNAME: data.EMPNAME,
              EMPUUID: data.EMPUUID,
              UUID: data.UUID,
              VEHICLEUUID: data.VEHICLEUUID,
              WORKTYPE: data.WORKTYPE,
              line: index + 1,
              key: this.tableKey++,
            });
          });

          form.validateFields();
        }
      });

      this.entity['V_SJ_ITMS_SCHEDULE'][0].CARUUID = valueEvent.record.UUID;
      this.entity['V_SJ_ITMS_SCHEDULE'][0].CARCODE = valueEvent.record.CODE;
      this.entity['V_SJ_ITMS_SCHEDULE'][0].CARPLATENUMBER = valueEvent.record.PLATENUMBER;
      this.entity['V_SJ_ITMS_SCHEDULE'][0].VEHICLETYPEUUID = valueEvent.record.VEHICLETYPEUUID;
      this.entity['V_SJ_ITMS_SCHEDULE'][0].VEHICLETYPECODE = valueEvent.record.VEHICLETYPECODE;
      this.entity['V_SJ_ITMS_SCHEDULE'][0].VEHICLETYPENAME = valueEvent.record.VEHICLETYPENAME;
    }
  };

  onSave = async () => {
    const { entity } = this;
    await removeCar(entity).then(result => {
      if (result.success) {
        this.onSaved(result.success);
        message.success('移车成功,已作废此排车单,生成对应的新排车单');
      } else {
        message.success('移车时发生错误，请联系管理员');
      }
    });
  };

  initEntity = () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
    this.initUpdateEntity(onlFormInfos);
  };
}
