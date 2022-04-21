/*
 * @Author: Liaorongchang
 * @Date: 2022-04-20 10:41:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-21 12:00:21
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form } from 'antd';
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
    console.log('valueEvent', valueEvent);

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

      console.log(this.entity);
    }
  };

  onSave = async () => {
    const { entity } = this;
    console.log('entity', entity);
    await removeCar(entity);
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
