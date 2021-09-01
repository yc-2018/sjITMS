import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import {
  message, Form, Input, Col, DatePicker, InputNumber, Radio, Select, Row
} from 'antd';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { binScopePattern, codePattern } from '@/utils/PatternContants';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CarrierSelect from '@/pages/Component/Select/CarrierSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import VehicleTypeSelect from './VehicleTypeSelect';
import RadioGroup from 'antd/lib/radio/group';
import { VehicleLocale, VehicleState } from './VehicleLocale';
import { orgType } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import VehicleEmployeeTableForCreate from './VehicleEmployeeTableForCreate';
const FormItem = Form.Item;

@connect(({ vehicle, loading }) => ({
  vehicle,
  loading: loading.models.vehicle,
}))
@Form.create()
export default class VehicleCreate extends CreatePage {
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
    if (nextProps.vehicle.entity) {
      this.setState({
        entity: nextProps.vehicle.entity,
        title: nextProps.vehicle.entity.code
      });
    }
  }

  refresh = () => {
    let uuid = this.props.vehicle.entity.uuid;
    if (uuid) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })

      this.props.dispatch({
        type: 'vehicle/getByUuidForCreate',
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
    console.log(data);
    const { entity } = this.state;
    const { form, dispatch } = this.props;
    const param = { ...entity };
    param.companyUuid = loginCompany().uuid;
    param.code = data.code;
    param.plateNumber = data.plateNumber;
    param.vehicleType = JSON.parse(data.vehicleType);
    param.carrier = JSON.parse(data.carrier);
    param.mileage = data.mileage;
    param.oilConsumption = data.oilConsumption;
    param.tailPlate = data.tailPlate;
    param.gps = data.gps;
    param.note = data.note;
    param.etc = data.etc;
    param.brand = data.brand;
    param.mailNumber = data.mailNumber;
    const dispatchCenters = [];
    data.dispatchCenters.forEach(function (e) {
      var dispatchCenter = new Object();
      dispatchCenter["uuid"] = JSON.parse(e).uuid;
      dispatchCenter["code"] = JSON.parse(e).code;
      dispatchCenter["name"] = JSON.parse(e).name;
      dispatchCenters.push(dispatchCenter);
    });
    param.dispatchCenters = dispatchCenters;
    let type = 'vehicle/add';
    if (entity.uuid) {
      type = 'vehicle/modify';
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
      type: 'vehicle/showPage',
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
      type: 'vehicle/showPage',
      payload: {
        ...payload
      }
    });
  }

  drawBasicInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let initialValues = [];
    if (entity && entity.vehicleDispatchCenters) {
      entity.vehicleDispatchCenters.map(value => {
        initialValues.push(JSON.stringify({
          uuid: value.dispatchCenter.uuid,
          code: value.dispatchCenter.code,
          name: value.dispatchCenter.name,
          type: "DISPATCH_CENTER",
        }));
      });
    }

    let basicInfoCols = [];
    if (entity.code) {
      basicInfoCols.push(
        <CFormItem key="code" label={commonLocale.codeLocale}>
          {getFieldDecorator('code', {
            initialValue: entity && entity.uuid ? entity.code : undefined,
          })
            (
              <Col>{entity.code ? entity.code : <Empty />}</Col>
            )}
        </CFormItem>,
        <CFormItem key="plateNumber" label={VehicleLocale.plateNo}>
          {getFieldDecorator('plateNumber', { initialValue: entity && entity.uuid ? entity.plateNumber : undefined })
            (
              <Col>{entity.plateNumber ? entity.plateNumber : <Empty />}</Col>
            )}
        </CFormItem>
      );
    } else {
      basicInfoCols.push(
        <CFormItem key='code' label={commonLocale.codeLocale}>
          {getFieldDecorator('code', {
            initialValue: entity && entity.uuid ? entity.code : '', rules: [{
              required: true, message: notNullLocale(commonLocale.codeLocale)
            }, {
              pattern: codePattern.pattern,
              message: codePattern.message,
            }]
          })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
          )}
        </CFormItem>,
        <CFormItem key='plateNumber' label={VehicleLocale.plateNo}>
          {getFieldDecorator('plateNumber', {
            initialValue: entity && entity.uuid ? entity.plateNumber : '', rules: [{
              required: true, message: notNullLocale(VehicleLocale.plateNo)
            }, {
              max: 30,
              message: '最大长度为30'
            }]
          })(
            <Input placeholder={placeholderLocale(VehicleLocale.plateNo)} />
          )}
        </CFormItem>,
      );
    }
    if (loginOrg().type !== undefined && loginOrg().type === orgType.company.name) {
      basicInfoCols.push(
        <CFormItem key='vehicleType' label={VehicleLocale.vehicleType}>
          {getFieldDecorator('vehicleType', {
            initialValue: entity && entity.vehicleType ? JSON.stringify(entity.vehicleType) : undefined,
            rules: [{
              required: true, message: notNullLocale(VehicleLocale.vehicleType)
            }],
          })(<VehicleTypeSelect placeholder={placeholderChooseLocale(VehicleLocale.vehicleType)} />)}
        </CFormItem>,
        <CFormItem key='carrier' label={VehicleLocale.carrier}>
          {getFieldDecorator('carrier', {
            initialValue: entity && entity.carrier ? JSON.stringify(entity.carrier) : undefined,
            rules: [{
              required: true, message: notNullLocale(VehicleLocale.carrier)
            }],
          })(<CarrierSelect placeholder={placeholderChooseLocale(VehicleLocale.carrier)} />)}
        </CFormItem>,
        <CFormItem key='dispatchCenters' label={VehicleLocale.dispatchCenters}>
          {getFieldDecorator('dispatchCenters', {
            rules: [
              { required: true, message: notNullLocale(VehicleLocale.dispatchCenters) },
            ],
            initialValue: entity ? initialValues : [],
          })(<OrgSelect
            placeholder={placeholderLocale(VehicleLocale.dispatchCenters)}
            upperUuid={loginCompany().uuid}
            type={'DISPATCH_CENTER'}
            mode="multiple"
          />)}
        </CFormItem>,
        <CFormItem key='brand' label={VehicleLocale.brand}>
          {getFieldDecorator('brand', {
            initialValue: entity && entity.uuid ? entity.brand : '', rules: [{
              required: false, message: notNullLocale(VehicleLocale.brand)
            }, {
              max: 30,
              message: '最大长度为30'
            }]
          })(
            <Input placeholder={placeholderLocale(VehicleLocale.brand)} />
          )}
        </CFormItem>,
        <CFormItem key='etc' label={VehicleLocale.etc}>
          {getFieldDecorator('etc', {
            initialValue: entity && entity.uuid ? entity.etc : '', rules: [{
              required: false, message: notNullLocale(VehicleLocale.etc)
            }, {
              max: 30,
              message: '最大长度为30'
            }]
          })(
            <Input placeholder={placeholderLocale(VehicleLocale.etc)} />
          )}
        </CFormItem>,

      );
    } else if (loginOrg().type !== undefined && loginOrg().type === orgType.dispatchCenter.name) {
      var dis = '';
      if (entity.vehicleDispatchCenters != undefined) {
        entity.vehicleDispatchCenters.forEach(function (e) {
          dis = dis + e.dispatchCenter.name + '[' + e.dispatchCenter.code + ']、';
        });
      }
      dis = dis.substring(0, dis.length - 1);
      basicInfoCols.push(
        <CFormItem key="vehicleType" label={VehicleLocale.vehicleType}>
          {getFieldDecorator('vehicleType', { initialValue: entity && entity.vehicleType ? JSON.stringify(entity.vehicleType) : undefined })
            (
              <Col>{entity.vehicleType ? convertCodeName(entity.vehicleType) : <Empty />}</Col>
            )}
        </CFormItem>,
        <CFormItem key="carrier" label={VehicleLocale.carrier}>
          {getFieldDecorator('carrier', { initialValue: entity && entity.carrier ? JSON.stringify(entity.carrier) : undefined })
            (
              <Col>{entity.carrier ? convertCodeName(entity.carrier) : <Empty />}</Col>
            )}
        </CFormItem>,
        <CFormItem key="dispatchCenters" label={VehicleLocale.dispatchCenters}>
          {getFieldDecorator('dispatchCenters', { initialValue: entity ? initialValues : [] })
            (
              <Col>{ dis}</Col>
            )}
        </CFormItem>,
        <CFormItem key="brand" label={VehicleLocale.brand}>
          {getFieldDecorator('brand', { initialValue: entity && entity.brand ? entity.brand : undefined })
            (
              <Col>{entity.brand ? entity.brand : <Empty />}</Col>
            )}
        </CFormItem>,
        <CFormItem key="etc" label={VehicleLocale.etc}>
          {getFieldDecorator('etc', { initialValue: entity && entity.etc ? entity.etc : undefined })
            (
              <Col>{entity.etc ? entity.etc : <Empty />}</Col>
            )}
        </CFormItem>);
      basicInfoCols.push(
        <CFormItem key='mailNumber' label={VehicleLocale.mailNumber}>
          {getFieldDecorator('mailNumber', {
            initialValue: entity && entity.uuid ? entity.mailNumber : '', rules: [{
              required: false, message: notNullLocale(VehicleLocale.mailNumber)
            }, {
              max: 50,
              message: '最大长度为50'
            }]
          })(
            <Input placeholder={placeholderLocale(VehicleLocale.mailNumber)} />
          )}
        </CFormItem>
      );
      basicInfoCols.push(
        <CFormItem key="state" label={commonLocale.stateLocale}>
          {getFieldDecorator('state', { initialValue: entity && entity.state ? VehicleState[entity.state].caption : undefined })
          (
            <Col>{entity.state ? VehicleState[entity.state].caption : <Empty />}</Col>
          )}
        </CFormItem>
      );
    }

    return basicInfoCols;
  }

  drawExtendInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let extendInfoCols = [];
    if (loginOrg().type !== undefined && loginOrg().type === orgType.company.name) {
      extendInfoCols.push(
        <CFormItem key='mileage' label={VehicleLocale.mileage}>
          {getFieldDecorator('mileage', {
            initialValue: entity && entity.uuid ? entity.mileage : 0,
          })(<InputNumber precision={3} min={0} max={99999999.999} style={{ width: '100%' }} />)}
        </CFormItem>,
        <CFormItem key='oilConsumption' label={VehicleLocale.oilConsumption}>
          {getFieldDecorator('oilConsumption', {
            initialValue: entity && entity.uuid ? entity.oilConsumption : 0,
          })(<InputNumber precision={3} min={0} max={99999999.999} style={{ width: '100%' }} />)}
        </CFormItem>,
        <CFormItem key='gps' label={'gps'}>
          {getFieldDecorator('gps', {
            initialValue: entity && entity.uuid ? entity.gps : true,
          })(<RadioGroup>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </RadioGroup>)}
        </CFormItem>,
        <CFormItem key='tailPlate' label={VehicleLocale.tailPlate}>
          {getFieldDecorator('tailPlate', {
            initialValue: entity && entity.uuid ? entity.tailPlate : true,
          })(<RadioGroup>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </RadioGroup>)}
        </CFormItem>,
      );
      return extendInfoCols;
    }else if(loginOrg().type !== undefined && loginOrg().type === orgType.dispatchCenter.name){
      extendInfoCols.push(
        <CFormItem key='mileage' label={VehicleLocale.mileage}>
          {getFieldDecorator('mileage', {
            initialValue: entity && entity.uuid ? entity.mileage : 0,
          })(<Col>{entity.mileage ? entity.mileage : <Empty />}</Col>)}
        </CFormItem>,
        <CFormItem key='oilConsumption' label={VehicleLocale.oilConsumption}>
          {getFieldDecorator('oilConsumption', {
            initialValue: entity && entity.uuid ? entity.oilConsumption : 0,
          })(<Col>{entity.oilConsumption ? entity.oilConsumption : <Empty />}</Col>)}
        </CFormItem>,
        <CFormItem key='gps' label={'gps'}>
          {getFieldDecorator('gps', {
            initialValue: entity && entity.uuid ? entity.gps : true,
          })(<Col>{entity.gps ? (entity.gps === true ? '是' : '否'):<Empty />}</Col>)}
        </CFormItem>,
        <CFormItem key='tailPlate' label={VehicleLocale.tailPlate}>
          {getFieldDecorator('tailPlate', {
            initialValue: entity && entity.uuid ? entity.tailPlate : true,
          })(<Col>{entity.tailPlate ? (entity.tailPlate === true ? '是' : '否'):<Empty />}</Col>)}
        </CFormItem>,
      );
      return extendInfoCols;
    }
  
  }

  drawFormItems = () => {

    const { entity } = this.state;
    let panels = [
      <FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} />,
      <FormPanel key="extendInfo" title={VehicleLocale.extendInfo} cols={this.drawExtendInfoCols()} />
    ];
    if( loginOrg().type !== undefined && loginOrg().type === orgType.dispatchCenter.name ) {
      panels.push(<VehicleEmployeeTableForCreate />)
    }

    return panels;
  }
}
