import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import {
  message, Form, Input, Col, DatePicker, InputNumber, Radio, Select, Row
} from 'antd';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { binScopePattern } from '@/utils/PatternContants';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { commonLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { VehicleTypeLocale, VehicleUsage, CarType } from './VehicleTypeLocale';
import { codePattern } from '@/utils/PatternContants';
const FormItem = Form.Item;

@connect(({ vehicleType, loading }) => ({
  vehicleType,
  loading: loading.models.vehicleType,
}))
@Form.create()
export default class VehicleTypeCreate extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale,
      currentView: CONFIRM_LEAVE_ACTION.NEW,
      entity: {
        companyUuid: loginCompany().uuid,
      },
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.vehicleType.entity && this.props.vehicleType.uuid) {
      this.setState({
        entity: nextProps.vehicleType.entity,
        title: nextProps.vehicleType.entity.code
      });
    }
  }

  refresh = () => {
    let uuid = this.props.vehicleType.uuid;
    if (uuid) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })

      this.props.dispatch({
        type: 'vehicleType/getByUuid',
        payload: uuid
      });
    }
  }

  onSave = (data) => {
    this.onCreate(data, true)
  }

  onSaveAndCreate = (data) => {
    this.onCreate(data, false);
  }

  onCreate = (data, isGoDetail) => {
    const { entity } = this.state;
    const { form, dispatch } = this.props;
    const param = { ...entity };
    param.companyUuid = loginCompany().uuid;
    param.code = data.code;
    param.name = data.name;
    param.bearWeight = data.bearWeight;
    param.length = data.length*100;
    param.width = data.width*100;
    param.height = data.height*100;
    param.bearVolumeRate = data.bearVolumeRate;
    param.note = data.note;
    param.usage = data.usage;
    param.carType = data.carType;

    let type = 'vehicleType/add';
    if (entity.uuid) {
      type = 'vehicleType/modify';
    }
    dispatch({
      type: type,
      payload: param,
      callback: response => {
        if (response && response.success) {
          let uuid;
          if (entity.uuid) {
            message.success(commonLocale.modifySuccessLocale);
            uuid = entity.uuid;
          } else {
            message.success(commonLocale.saveSuccessLocale);
            uuid = response.data;
          }
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
            },
          });
          this.props.form.resetFields();
          if (isGoDetail) {
            this.onView(uuid);
          }
        }
      },
    });
  }

  onView = (uuid) => {
    this.props.dispatch({
      type: 'vehicleType/showPage',
      payload: {
        showPage: 'view',
        uuid: uuid
      }
    });
  }

  onCancel = () => {
    const payload = {
      showPage: 'query',
      entity: {},
      uuid: ''
    }
    this.props.dispatch({
      type: 'vehicleType/showPage',
      payload: {
        ...payload
      }
    });
  }

  drawBasicInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    return [
      <CFormItem key='code' label={commonLocale.codeLocale}>
        {getFieldDecorator('code', {
          initialValue: entity && entity.uuid ? entity.code : undefined,
          rules: [{
            required: true, message: notNullLocale(commonLocale.codeLocale)
          }, {
            pattern: codePattern.pattern,
            message: codePattern.message,
          },],
        })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
        )}
      </CFormItem>,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {getFieldDecorator('name', {
          initialValue: entity && entity.uuid ? entity.name : '', rules: [{
            required: true, message: notNullLocale(commonLocale.nameLocale)
          }, {
            max: 30,
            message: tooLongLocale(commonLocale.nameLocale, 30),
          },],
        })(
          <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
        )}
      </CFormItem>,
      <CFormItem key='usage' label={VehicleTypeLocale.usage}>
        {getFieldDecorator('usage', {
          initialValue: entity && entity.usage ? entity.usage : undefined,
          rules: [{
            required: true, message: notNullLocale(VehicleTypeLocale.usage)
          }],
        })(<Select placeholder={placeholderChooseLocale(VehicleTypeLocale.usage)}>
          <Option value='REFRIGERATION'>{VehicleUsage['REFRIGERATION']}</Option>
          <Option value='HOMOIOTHERMY'>{VehicleUsage['HOMOIOTHERMY']}</Option>
          <Option value='CONSTANTTEMPERATURE'>{VehicleUsage['CONSTANTTEMPERATURE']}</Option>
        </Select>)}
      </CFormItem>,
       <CFormItem key='carType' label={VehicleTypeLocale.carType}>
       {getFieldDecorator('carType', {
         initialValue: entity && entity.carType ? entity.carType : undefined,
         rules: [{
           required: true, message: notNullLocale(VehicleTypeLocale.carType)
         }],
       })(<Select placeholder={placeholderChooseLocale(VehicleTypeLocale.carType)}>
         <Option value='BIG'>{CarType['BIG']}</Option>
         <Option value='MEDIUM'>{CarType['MEDIUM']}</Option>
         <Option value='SMALL'>{CarType['SMALL']}</Option>
       </Select>)}
     </CFormItem>
    ];
  }

  drawScopeCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    function convertPickArea(entity) {
      let result = [];
      entity.pickAreas.forEach(pickArea => {
        result.push(JSON.stringify(pickArea));
      });
      return result;
    }

    return [
      <CFormItem key='length' label={VehicleTypeLocale.length}>
        {getFieldDecorator('length', {
          initialValue: entity && entity.uuid ? entity.length/100 : 0,
          rules: [{
            required: true, message: notNullLocale(VehicleTypeLocale.length)
          }],
        })
          (<InputNumber precision={3} min={0} max={99999999.999} style={{ width: '100%' }} />)}
      </CFormItem>,
      <CFormItem key='width' label={VehicleTypeLocale.width}>
        {getFieldDecorator('width', {
          initialValue: entity && entity.uuid ? entity.width/100 : 0,
          rules: [{
            required: true, message: notNullLocale(VehicleTypeLocale.width)
          }],
        })
          (<InputNumber precision={3} min={0} max={99999999.999} style={{ width: '100%' }} />)}
      </CFormItem>,
      <CFormItem
        key='height'
        label={VehicleTypeLocale.height}
      >
        {getFieldDecorator('height', {
          initialValue: entity && entity.uuid ? entity.height/100 : 0,
          rules: [{
            required: true, message: notNullLocale(VehicleTypeLocale.height)
          }],
        })(<InputNumber precision={3} min={0} max={99999999.999} style={{ width: '100%' }} />)}
      </CFormItem>,
      <CFormItem
        key='bearWeight'
        label={VehicleTypeLocale.bearWeight}
      >
        {getFieldDecorator('bearWeight',
          {
            initialValue: entity && entity.uuid ? entity.bearWeight : 0,
            rules: [{
              required: true, message: notNullLocale(VehicleTypeLocale.bearWeight)
            }],
          })(<InputNumber precision={3} min={0} max={99999999.999} style={{ width: '100%' }} />
          )}
      </CFormItem>,
      <CFormItem key="bearVolumeRate" label={VehicleTypeLocale.bearVolumeRate}>
        {getFieldDecorator('bearVolumeRate',
          {
            initialValue: entity && entity.uuid ? entity.bearVolumeRate : 0,
            rules: [{
              required: true, message: notNullLocale(VehicleTypeLocale.bearVolumeRate)
            }],
          })(
            <InputNumber precision={3} min={0} max={100} style={{ width: '100%' }} />
          )}
      </CFormItem>
    ];
  }


  drawFormItems = () => {

    const { entity } = this.state;
    let panels = [
      <FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} />,
      <FormPanel key="scopeInfo" title={VehicleTypeLocale.extendInfo} cols={this.drawScopeCols()} />];

    return panels;
  }
}
