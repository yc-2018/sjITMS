/*
 * @Author: Liaorongchang
 * @Date: 2022-04-20 10:41:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-03-02 17:30:03
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, message, Input } from 'antd';
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
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      CCCWEIGHT: '',
      CCCVOLUME: '',
      saveControl: false,
    };
  }

  exHandleChange = async e => {
    const { fieldName, valueEvent } = e;
    const { form } = this.props;

    if (fieldName == 'REMOVECAR' && valueEvent) {
      if (valueEvent.record.JOB_STATE != 'Used') {
        message.error(valueEvent.record.PLATENUMBER + '不是正常状态，不能选择！');
        this.setState({ saveControl: true });
        return;
      }
      const param = {
        tableName: 'sj_itms_vehicle_employee',
        condition: {
          params: [
            { field: 'vehicleuuid', rule: 'eq', val: [valueEvent.record.UUID] },
            { field: 'companyuuid', rule: 'eq', val: [loginCompany().uuid] },
          ],
        },
      };

      this.props.form.setFieldsValue({ ['CCCWEIGHT']: valueEvent.record.BEARWEIGHT });
      this.props.form.setFieldsValue({ ['CCCVOLUME']: valueEvent.record.BEARVOLUME });
      this.setState({
        CCCWEIGHT: valueEvent.record.BEARWEIGHT,
        CCCVOLUME: valueEvent.record.BEARVOLUME,
        saveControl: false,
      });

      this.entity['SJ_ITMS_VEHICLE_EMPLOYEE'] = [];
      form.validateFields();
      await dynamicqueryById(param).then(result => {
        if (result.success && result.result.records !== 'false') {
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
    const { CCCWEIGHT, CCCVOLUME, saveControl } = this.state;
    if (saveControl) {
      message.error('该车辆不是正常状态，不能选择！');
      return;
    }

    const schedule = entity['V_SJ_ITMS_SCHEDULE'][0];
    const { WEIGHT } = schedule;
    if (CCCWEIGHT && CCCVOLUME) {
      if (WEIGHT > CCCWEIGHT) {
        message.error('该排车单重量超出，请重新选择');
        return;
      }
    }

    await removeCar(entity).then(result => {
      if (result.success) {
        const response = { response: result };
        this.onSaved(response);
        message.success('移车成功,已作废此排车单,生成对应的新排车单');
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

  formLoaded = () => {
    const { formItems } = this.state;

    formItems['CCCWEIGHT'] = {
      categoryName: '移车信息',
      component: Input,
      fieldName: 'CCCWEIGHT',
      fieldShowType: 'text',
      key: 'CCCWEIGHT',
      label: '车辆承重',
      tableName: 'V_SJ_ITMS_SCHEDULE',
      props: { disabled: true },
    };

    formItems['CCCVOLUME'] = {
      categoryName: '移车信息',
      component: Input,
      fieldName: 'CCCVOLUME',
      fieldShowType: 'text',
      key: 'CCCVOLUME',
      label: '车辆体积',
      tableName: 'V_SJ_ITMS_SCHEDULE',
      props: { disabled: true },
    };
  };
}
