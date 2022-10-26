/*
 * @Author: Liaorongchang
 * @Date: 2022-03-25 10:17:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-26 09:25:52
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Input, message } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { loginCompany } from '@/utils/LoginContext';
import { dynamicqueryById } from '@/services/quick/Quick';
import { commonLocale } from '@/utils/CommonLocale';
import { calculateMemberWage } from '@/services/cost/CostCalculation';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ScheduleCreatePage extends QuickCreatePage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      CCCWEIGHT: '',
      CCCVOLUME: '',
    };
  }

  exHandleChange = async e => {
    const { fieldName, valueEvent } = e;
    const { form } = this.props;
    if (fieldName == 'VEHICLEUUID' && valueEvent) {
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
      let cc = undefined;
      form.validateFields();
      await dynamicqueryById(param).then(result => {
        if (result.success && result.result.records !== 'false') {
          const billuuid = this.entity.sj_itms_schedule[0].UUID;
          const member = result.result.records;
          member.forEach((data, index) => {
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

          cc = member.find(x => x.WORKTYPE == 'Driver');
          if (cc != undefined) {
            this.entity['sj_itms_schedule'][0] = {
              ...this.entity['sj_itms_schedule'][0],
              CARRIERUUID: cc.UUID,
              CARRIERCODE: cc.EMPCODE,
              CARRIERNAME: cc.EMPNAME,
            };
            this.props.form.setFieldsValue({
              ['sj_itms_schedule_CARRIERUUID']: '[' + cc.EMPCODE + ']' + cc.EMPNAME,
            });
          }
        }
        if (cc == undefined) {
          this.entity['sj_itms_schedule'][0] = {
            ...this.entity['sj_itms_schedule'][0],
            CARRIERUUID: '',
            CARRIERCODE: '',
            CARRIERNAME: '',
          };
          this.props.form.setFieldsValue({
            ['sj_itms_schedule_CARRIERUUID']: '',
          });
        }
        form.validateFields();
      });
    }
  };

  beforeSave = entity => {
    const { CCCWEIGHT, CCCVOLUME } = this.state;
    const schedule = entity['sj_itms_schedule'][0];
    const { WEIGHT } = schedule;
    if (CCCWEIGHT && CCCVOLUME) {
      if (WEIGHT > CCCWEIGHT) {
        message.error('该排车单重量超出，请重新选择');
        return false;
      }
    }
  };

  formLoaded = () => {
    const { formItems } = this.state;
    console.log('formItems', formItems);
    if (this.props.extension) {
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
    }
  };

  onSave = async data => {
    const { entity } = this;
    const { onlFormInfos } = this.state;

    //保存前对address字段做处理 不进行保存
    for (let onlFormInfo of onlFormInfos) {
      let addItem = onlFormInfo.onlFormFields.find(item => item.fieldShowType == 'address');
      if (addItem) {
        delete this.entity[onlFormInfo.onlFormHead.tableName][0][addItem.dbFieldName];
      }
    }

    const result = this.beforeSave(entity);
    if (result === false) {
      return;
    }

    this.onSaveSetOrg();

    const editableState = ['Approved', 'Shipping', 'Shiped'];
    //入参
    const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
    this.onSaving();
    const response = await this.saveEntityData(param);
    const success = response.success == true;
    this.afterSave(success);
    this.onSaved({ response, param });
    if (success) {
      message.success(commonLocale.saveSuccessLocale);
      if (editableState.includes(entity.sj_itms_schedule[0].STAT)) {
        const operation = await calculateMemberWage(entity.sj_itms_schedule[0].BILLNUMBER);
      }
    }
  };
}
