import { connect } from 'dva';
import { Form, Input, Select, InputNumber, message, Radio } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { convertCodeName } from '@/utils/utils';
import { palletBinTypeLocale } from './PalletBinTypeLocale'
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import React from 'react';

const RadioGroup = Radio.Group;
const Option = Select.Option;

@connect(({ palletBinType, loading }) => ({
  palletBinType,
  loading: loading.models.palletBinType,
}))
@Form.create()
export default class PalletBinTypeCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {//设置初始值
      title: commonLocale.createLocale + palletBinTypeLocale.title,
      currentView: CONFIRM_LEAVE_ACTION.NEW,
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
      spinning: false,
      index: 0,
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.palletBinType.entity && this.props.palletBinType.entityUuid) {
      this.setState({
        entity: nextProps.palletBinType.entity,
        title: convertCodeName(nextProps.palletBinType.entity)
      });
    }
  }

  refresh = () => {
    let entityUuid = this.props.palletBinType.entityUuid;
    if (entityUuid) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })
    }
      this.props.dispatch({
        type: 'palletBinType/get',
        payload: entityUuid
      });

  }

  formValueToEntity = () => {
    const { entity, index } = this.state;
    const data = this.props.form.getFieldsValue();

    const currentValue = {
      ...entity
    };
    currentValue.code = data.code;
    currentValue.name = data.name;
    currentValue.name = data.name;
    currentValue.barCodePrefix = data.barCodePrefix;
    currentValue.barCodeLength = data.barCodeLength;
    currentValue.length = data.length;
    currentValue.width = data.width;
    currentValue.height = data.height;
    currentValue.weight = data.weight;
    currentValue.plotRatio = data.plotRatio;
    currentValue.note = data.note;

    return currentValue;
  }

  onCancel = () => {
    const payload = {
      showPage: 'query'
    }
    this.props.dispatch({
      type: 'palletBinType/showPage',
      payload: {
        ...payload
      }
    });
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

    let type = 'palletBinType/add';
    if (entity.uuid) {
      type = 'palletBinType/modify';
    }

    dispatch({
      type: type,
      payload: this.formValueToEntity(),
      callback: (response) => {
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
              dcUuid: loginOrg().uuid
            },
            index: 0
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
      type: 'palletBinType/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let cols = [
      <CFormItem key='code' label={commonLocale.codeLocale} labelSpan={6}>
        {getFieldDecorator('code', {
          initialValue: entity.code,
          rules: [
            { required: true, message: notNullLocale(commonLocale.codeLocale) },
            {
              pattern: codePattern.pattern,
              message: codePattern.message,
            },
          ]
        })(<Input disabled={entity.uuid ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
      </CFormItem>,

      <CFormItem key='name' label={commonLocale.nameLocale}>
        {getFieldDecorator('name', {
          initialValue: entity.name,
          rules: [
            { required: true, message: notNullLocale(commonLocale.nameLocale) },
            {
              max: 30,
              message: tooLongLocale(commonLocale.nameLocale, 30),
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
      </CFormItem>,

      <CFormItem key='barCodePrefix' label={palletBinTypeLocale.barCodePrefix}>
        {getFieldDecorator('barCodePrefix', {
          initialValue: entity.barCodePrefix,
          rules: [
            { required: true, message: notNullLocale(palletBinTypeLocale.barCodePrefix) },
            {
              pattern: /^[A-Z0-9]{1,2}$/,
              message: palletBinTypeLocale.barCodePrefixRuleMessage,
            },
          ]
        })(<Input placeholder={placeholderLocale(palletBinTypeLocale.barCodePrefix)} />)}
      </CFormItem>,

      <CFormItem key='barCodeLength' label={palletBinTypeLocale.barCodeLength}>
        {getFieldDecorator('barCodeLength', {
          initialValue: entity.barCodeLength,
          rules: [
            { required: true, message: notNullLocale(palletBinTypeLocale.barCodeLength) },
          ]
        })(<InputNumber style={{ width: '100%' }} max={7} min={2} placeholder={placeholderLocale(palletBinTypeLocale.barCodeLength) + palletBinTypeLocale.barCodeLengthRule} />)}
      </CFormItem>,
    ];

    let qpcCols = [
      <CFormItem key='length' label={palletBinTypeLocale.length} labelSpan={6}>
        {getFieldDecorator('length', {
          initialValue: entity.length,
          rules: [
            { required: true, message: notNullLocale(palletBinTypeLocale.length) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(palletBinTypeLocale.length)} />)}
      </CFormItem>,

      <CFormItem key='width' label={palletBinTypeLocale.width}>
        {getFieldDecorator('width', {
          initialValue: entity.width,
          rules: [
            { required: true, message: notNullLocale(palletBinTypeLocale.width) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(palletBinTypeLocale.width)} />)}
      </CFormItem>,

      <CFormItem key='height' label={palletBinTypeLocale.height}>
        {getFieldDecorator('height', {
          initialValue: entity.height,
          rules: [
            { required: true, message: notNullLocale(palletBinTypeLocale.height) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(palletBinTypeLocale.height)} />)}
      </CFormItem>,

      <CFormItem key='weight' label={palletBinTypeLocale.weight}>
        {getFieldDecorator('weight', {
          initialValue: entity.weight,
          rules: [
            { required: true, message: notNullLocale(palletBinTypeLocale.weight) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999999} placeholder={placeholderLocale(palletBinTypeLocale.weight)} />)}
      </CFormItem>,

      <CFormItem key='plotRatio' label={palletBinTypeLocale.plotRatio} labelSpan={6}>
        {getFieldDecorator('plotRatio', {
          initialValue: entity.plotRatio,
          rules: [
            { required: true, message: notNullLocale(palletBinTypeLocale.plotRatio)  },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={100} placeholder={placeholderLocale(palletBinTypeLocale.plotRatio)} />)}
      </CFormItem>,
    ];

    let panels = [
      <FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} noteLabelSpan={3} cols={cols} noteCol={this.drawNotePanel()} />,
      <FormPanel key="qpcInfo" title={palletBinTypeLocale.qpcInfoLocale} cols={qpcCols} />
    ];

    return panels;
  }

}
