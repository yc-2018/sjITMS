/*
 * @Author: Liaorongchang
 * @Date: 2022-03-25 10:17:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-07 16:42:38
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Input, message,Modal } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { loginCompany } from '@/utils/LoginContext';
import { dynamicqueryById,dynamicQuery } from '@/services/quick/Quick';
import { commonLocale } from '@/utils/CommonLocale';
import { calculateMemberWage } from '@/services/cost/CostCalculation';
import { aborted } from '@/services/sjitms/VehicleWeight';

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
      saveControl: false,
    };
  }

  exHandleChange = async e => {
    const { fieldName, valueEvent } = e;
    const { form } = this.props;
    if (fieldName == 'VEHICLEUUID' && valueEvent) {
      if (valueEvent.record.JOB_STATE != 'Used') {
        message.error(valueEvent.record.PLATENUMBER + '不是正常状态，不能选择！');
        this.setState({ saveControl: true });
        return;
      }
      this.props.form.setFieldsValue({ ['CCCWEIGHT']: valueEvent.record.BEARWEIGHT });
      this.props.form.setFieldsValue({ ['CCCVOLUME']: valueEvent.record.BEARVOLUME });
      this.setState({
        CCCWEIGHT: valueEvent.record.BEARWEIGHT,
        CCCVOLUME: valueEvent.record.BEARVOLUME,
        saveControl: false,
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
              MEMBERUUID: data.EMPUUID,
              line: index + 1,
              key: this.tableKey++,
            });
          });
          cc = member.find(x => x.WORKTYPE == 'Driver');
          if (cc != undefined) {
            this.entity['sj_itms_schedule'][0] = {
              ...this.entity['sj_itms_schedule'][0],
              CARRIERUUID: cc.EMPUUID,
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
    } else if (fieldName == 'MEMBERTYPE' && valueEvent) {
      const member = this.entity['SJ_ITMS_SCHEDULE_MEMBER'];
      const driver = member.find(x => x.MEMBERTYPE == 'Driver');
      if (driver != undefined) {
        this.entity['sj_itms_schedule'][0] = {
          ...this.entity['sj_itms_schedule'][0],
          CARRIERUUID: driver.MEMBERUUID,
          CARRIERCODE: driver.MEMBERCODE,
          CARRIERNAME: driver.MEMBERNAME,
        };
      }
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
    const { onlFormInfos, saveControl } = this.state;
    if (saveControl) {
      message.error('该车辆不是正常状态，不能选择！');
      return;
    }

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
    if(this.props.planConfig?.rollbackApproval==1){
      const param = {
        tableName: 'sj_itms_schedule',
        condition: {
          params: [{ field: 'UUID', rule: 'eq', val: [entity.sj_itms_schedule[0].UUID] }],
        },
      };
      const result = await dynamicQuery(param);
      const data = result.result.records[0];
      if(data.PIRS!= '' && data.CHECKTIME !=null){
        if(data.STAT =='Shiped' || data.STAT=='Shipping'){
          entity.sj_itms_schedule[0].STAT ='Approved'
          entity.sj_itms_schedule[0].CHECKTIME ='';
          entity.sj_itms_schedule[0].PIRS ='';
          entity.sj_itms_schedule[0].SHIPSTARTTIME ='';
          entity.sj_itms_schedule[0].SHIPENDTIME ='';
         const Modaldis =  Modal.confirm({
            title:"该排车单状态会回退到已批准，是否继续操作？",
            onOk: ()=>{
              this.dosaved(entity);
              Modaldis.destroy();
            } 
          })
          return ;
        }
      }
     }
    this.dosaved(entity);
  };
  dosaved = async (entity)=>{
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

  afterSave = async data => {
    const { entity } = this;
    if (data) {
      const response = await aborted(entity['sj_itms_schedule'][0].UUID, 'updateVehicle');
    }
  };
}
