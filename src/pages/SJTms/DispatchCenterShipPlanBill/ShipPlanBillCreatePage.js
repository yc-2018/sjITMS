/*
 * @Author: Liaorongchang
 * @Date: 2022-03-25 10:17:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-19 15:58:25
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Input, message } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { loginCompany } from '@/utils/LoginContext';
import { saveOrUpdateEntities, dynamicqueryById } from '@/services/quick/Quick';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ShipPlanBillCreatePage extends QuickCreatePage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      CCCWEIGHT: '',
      CCCVOLUME: '',
    };
  }

  exHandleChange = async e => {
    const { tableName, fieldName, line, fieldShowType, props, valueEvent } = e;
    const { form } = this.props;
    if (fieldName == 'VEHICLECODE' && valueEvent) {
      console.log('valueEvent', valueEvent);
      this.props.form.setFieldsValue({ ['CCCWEIGHT']: valueEvent.record.BEARWEIGHT });
      this.props.form.setFieldsValue({ ['CCCVOLUME']: valueEvent.record.BEARVOLUME });
      this.setState({
        CCCWEIGHT: valueEvent.record.BEARWEIGHT,
        CCCVOLUME: valueEvent.record.BEARVOLUME,
      });
      const param = {
        tableName: 'sj_itms_vehicle_employee',
        condition: {
          params: [
            { field: 'vehicleuuid', rule: 'eq', val: [valueEvent.record.UUID] },
            { field: 'companyuuid', rule: 'eq', val: [loginCompany().uuid] },
          ],
        },
      };

      this.entity['SJ_ITMS_SCHEDULE_MEMBER'] = [];
      form.validateFields();
      await dynamicqueryById(param).then(result => {
        if (result.success && result.result.records !== 'false') {
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
        }
        form.validateFields();
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

  beforeSave = entity => {
    const { CCCWEIGHT, CCCVOLUME } = this.state;
    const schedule = entity['sj_itms_schedule'][0];
    const { WEIGHT, VOLUME } = schedule;
    if (CCCWEIGHT && CCCVOLUME) {
      if (WEIGHT > CCCWEIGHT || VOLUME > CCCVOLUME) {
        message.error('该排车单重量或体积超出，请重新选择');
        return false;
      }
    }
  };

  formLoaded = () => {
    const { categories, formItems } = this.state;

    formItems['CCCWEIGHT'] = {
      categoryName: '车辆信息',
      component: Input,
      fieldName: 'CCCWEIGHT',
      fieldShowType: 'text',
      key: 'CCCWEIGHT',
      label: '车辆承重(换)',
      tableName: 'sj_itms_schedule',
      props: { disabled: true },
    };

    formItems['CCCVOLUME'] = {
      categoryName: '车辆信息',
      component: Input,
      fieldName: 'CCCVOLUME',
      fieldShowType: 'text',
      key: 'CCCVOLUME',
      label: '车辆体积(换)',
      tableName: 'sj_itms_schedule',
      props: { disabled: true },
    };
  };
}
