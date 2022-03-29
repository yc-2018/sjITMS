/*
 * @Author: Liaorongchang
 * @Date: 2022-03-25 10:17:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-28 17:24:09
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { loginCompany } from '@/utils/LoginContext';
import { saveOrUpdateEntities, dynamicqueryById } from '@/services/quick/Quick';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ShipPlanBillCreatePage extends QuickCreatePage {
  exHandleChange = async e => {
    const { tableName, fieldName, line, fieldShowType, props, valueEvent } = e;
    const { form } = this.props;
    if (fieldName == 'VEHICLECODE' && valueEvent) {
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
          this.entity['SJ_ITMS_SCHEDULE_MEMBER'] = [];
          const billuuid = this.entity.sj_itms_schedule[0].UUID;
          result.result.records.forEach((data, index) => {
            this.entity['SJ_ITMS_SCHEDULE_MEMBER'].push({
              BILLUUID: billuuid,
              LINE: index + 1,
              MEMBERCODE: data.EMPCODE,
              MEMBERNAME: data.EMPNAME,
              MEMBERTYPE: data.WORKTYPE,
              MEMBERUUID: data.UUID,
              line: index + 1,
              key: this.tableKey++,
            });
          });
          form.validateFields();
        }
      });
    }
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
